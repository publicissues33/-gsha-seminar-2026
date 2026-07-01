import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { createRegistration, listRegistrations, countRegistrations, countTodayRegistrations, getSetting, setSetting, deleteRegistration } from "./db";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import { sendConfirmationEmail } from "./email";
import { sdk } from "./_core/sdk";

/** 判斷報名是否已截止（手動關閉 OR 截止日期已過）
 *  deadline 格式：ISO 日期字串 "YYYY-MM-DD"，以台灣時區 (UTC+8) 當天 23:59:59 為截止時刻
 */
async function isRegistrationClosed(): Promise<boolean> {
  const [closed, deadline, count] = await Promise.all([
    getSetting("registrationClosed"),
    getSetting("registrationDeadline"),
    countRegistrations(),
  ]);

  if (closed === "true") return true;

  if (count >= 30) return true;

  if (deadline) {
    // 截止日期當天 23:59:59 台灣時間 = UTC+8
    const deadlineEnd = new Date(`${deadline}T23:59:59+08:00`);
    if (Date.now() > deadlineEnd.getTime()) return true;
  }

  return false;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1, "請輸入帳號"),
        password: z.string().min(1, "請輸入密碼"),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.username === "wetop777" && input.password === "20260806") {
          const sessionToken = await sdk.signSession({
            openId: "mock-admin-open-id",
            appId: process.env.VITE_APP_ID ?? "default",
            name: "系統管理員",
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          return { success: true };
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "帳號或密碼錯誤",
          });
        }
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  registration: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1, "姓名為必填"),
        company: z.string().min(1, "公司名稱為必填"),
        title: z.string().min(1, "職稱為必填"),
        phone: z.string().min(1, "電話為必填"),
        email: z.string().email("請輸入有效的 Email"),
      }))
      .mutation(async ({ input }) => {
        if (await isRegistrationClosed()) {
          const count = await countRegistrations();
          throw new TRPCError({
            code: "FORBIDDEN",
            message: count >= 30 ? "報名人數已達上限 (30人)，報名已額滿。" : "報名已截止，無法送出報名。",
          });
        }

        await createRegistration(input);

        await notifyOwner({
          title: `【環境醫生實務研討會】新報名通知 - ${input.name}`,
          content: `收到新的研討會報名申請：\n\n姓名：${input.name}\n公司：${input.company}\n職稱：${input.title}\n電話：${input.phone}\nEmail：${input.email}\n\n報名時間：${new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`,
        });



        // Forward to Google Sheet Webhook if configured
        const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK;
        if (sheetWebhook && sheetWebhook.trim()) {
          try {
            await fetch(sheetWebhook.trim(), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: input.name,
                company: input.company,
                title: input.title,
                phone: input.phone,
                email: input.email,
                createdAt: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
              }),
            });
            console.log("[GoogleSheet] Successfully forwarded registration to Google Sheet.");
          } catch (err) {
            console.error("[GoogleSheet] Failed to forward to Google Sheet:", err);
          }
        }

        return { success: true };
      }),

    // Admin-only: list all registrations
    list: adminProcedure
      .input(z.object({
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const all = await listRegistrations();
        if (!input?.search) return all;
        const q = input.search.toLowerCase();
        return all.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.company.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q)
        );
      }),

    // Admin-only: delete registration
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteRegistration(input.id);
        return { success: true };
      }),

    // Admin-only: stats
    stats: adminProcedure
      .query(async () => {
        const [total, today] = await Promise.all([
          countRegistrations(),
          countTodayRegistrations(),
        ]);
        const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
        return { total, today, smtpConfigured };
      }),
  }),

  settings: router({
    // Public: 前台查詢報名是否截止（整合手動開關 + 截止日期）
    getRegistrationStatus: publicProcedure
      .query(async () => {
        const [closed, rawDeadline, count] = await Promise.all([
          getSetting("registrationClosed"),
          getSetting("registrationDeadline"),
          countRegistrations(),
        ]);
        // 空字串視同未設定
        const deadline = rawDeadline && rawDeadline.trim() ? rawDeadline.trim() : null;
        const registrationClosed = await isRegistrationClosed();
        return {
          registrationClosed,
          manualClosed: closed === "true",
          deadline,
          isFull: count >= 30,
          currentCount: count,
        };
      }),

    // Admin-only: 切換截止報名開關
    setRegistrationClosed: adminProcedure
      .input(z.object({ closed: z.boolean() }))
      .mutation(async ({ input }) => {
        await setSetting("registrationClosed", input.closed ? "true" : "false");
        return { success: true, registrationClosed: input.closed };
      }),

    // Public: 取得截止日期
    getRegistrationDeadline: publicProcedure
      .query(async () => {
        const raw = await getSetting("registrationDeadline");
        // 空字串視同未設定
        const deadline = raw && raw.trim() ? raw.trim() : null;
        return { deadline };
      }),

    // Admin-only: 設定截止日期（格式 "YYYY-MM-DD"，傳 null 表示清除）
    setRegistrationDeadline: adminProcedure
      .input(z.object({
        deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式須為 YYYY-MM-DD").nullable(),
      }))
      .mutation(async ({ input }) => {
        // 清除時寫入空字串；getRegistrationDeadline 會將空字串視同 null
        await setSetting("registrationDeadline", input.deadline ?? "");
        return { success: true, deadline: input.deadline };
      }),
  }),
});

export type AppRouter = typeof appRouter;
