import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "../../shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [k, v] = pair.split("=");
    if (k && k.trim() === name) {
      return v ? decodeURIComponent(v.trim()) : null;
    }
  }
  return null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    let sessionToken = parseCookie(opts.req.headers.cookie, COOKIE_NAME);

    if (!sessionToken) {
      const authHeader = opts.req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }

    if (sessionToken) {
      const session = await sdk.verifySession(sessionToken);
      if (session && session.openId === "mock-admin-open-id") {
        user = {
          id: 1,
          openId: "mock-admin-open-id",
          name: "系統管理員",
          email: "admin@example.com",
          loginMethod: "local",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };
      }
    }
  } catch (error) {
    console.warn("[Auth] Failed to authenticate request:", error);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
