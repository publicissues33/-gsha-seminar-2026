import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

export async function sendConfirmationEmail(to: string, registrantName: string, regDetails: {
  company: string;
  title: string;
  phone: string;
  email: string;
}): Promise<boolean> {
  const subject = "【環境醫生實務研討會】報名確認信";
  const textContent = `
親愛的 ${registrantName} 您好：

感謝您報名「環境醫生實務研討會」！以下是您的報名資料確認：

-----------------------------------
活動資訊：
📅 日期：2026 年 8 月 6 日（週四）
⏰ 時間：16:00 - 18:00（16:00 開始報到）
📍 地點：台中 TOP1 環球經貿中心頂樓交誼廳

您的報名資料：
👤 姓名：${registrantName}
🏢 公司：${regDetails.company}
💼 職稱：${regDetails.title}
📞 電話：${regDetails.phone}
✉️ Email：${regDetails.email}
-----------------------------------

主辦單位將於活動前數日以 Email 發送最終確認通知與入場提醒，敬請留意信箱。
如有任何疑問，歡迎隨時與我們聯繫。

全球華人智慧健康產業發展協會（GSHA） 敬上
`;

  // Check if SMTP is configured in env variables
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "no-reply@gsha-event.org";

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"GSHA 主辦單位" <${from}>`,
        to,
        subject,
        text: textContent,
      });

      console.log(`[Email] Real confirmation email sent to ${to} via SMTP.`);
      return true;
    } catch (error) {
      console.error("[Email] Failed to send real email via SMTP:", error);
    }
  }

  // Fallback: Log to console and local file
  const logDir = path.resolve(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.resolve(logDir, "sent_emails.log");
  const logEntry = `\n========================================\nTime: ${new Date().toISOString()}\nTo: ${to}\nSubject: ${subject}\nContent:\n${textContent}\n========================================\n`;
  
  try {
    fs.appendFileSync(logFile, logEntry, "utf-8");
    console.log(`[Email] SMTP not configured. Logged confirmation email for ${to} to logs/sent_emails.log`);
  } catch (err) {
    console.error(`[Email] Failed to write email fallback log:`, err);
  }
  return false;
}
