import { useState } from "react";
import { User, Building2, Briefcase, Phone, Mail, Send, CheckCircle2, AlertCircle, BanIcon, CalendarDays, MapPin, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface FormData {
  name: string;
  company: string;
  title: string;
  phone: string;
  email: string;
}

const initialForm: FormData = { name: "", company: "", title: "", phone: "", email: "" };

const fields = [
  { key: "name" as keyof FormData,    label: "姓名",     placeholder: "請輸入您的姓名",   icon: User,      type: "text",  required: true },
  { key: "company" as keyof FormData, label: "公司名稱", placeholder: "請輸入公司名稱",   icon: Building2, type: "text",  required: true },
  { key: "title" as keyof FormData,   label: "職稱",     placeholder: "請輸入您的職稱",   icon: Briefcase, type: "text",  required: true },
  { key: "phone" as keyof FormData,   label: "聯絡電話", placeholder: "請輸入聯絡電話",   icon: Phone,     type: "tel",   required: true },
  { key: "email" as keyof FormData,   label: "Email",    placeholder: "請輸入電子郵件",   icon: Mail,      type: "email", required: true },
];

export default function RegisterSection() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);

  // 查詢截止報名狀態（公開 API，無需登入）
  const { data: registrationStatus } = trpc.settings.getRegistrationStatus.useQuery();
  const isClosed = registrationStatus?.registrationClosed ?? false;

  const submitMutation = trpc.registration.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm(initialForm);
      toast.success("報名成功！感謝您的報名，我們將盡快與您聯繫。");
    },
    onError: (err) => {
      toast.error(`報名失敗：${err.message}`);
    },
  });

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.name.trim())    e.name    = "姓名為必填";
    if (!form.company.trim()) e.company = "公司名稱為必填";
    if (!form.title.trim())   e.title   = "職稱為必填";
    if (!form.phone.trim())   e.phone   = "電話為必填";
    if (!form.email.trim()) {
      e.email = "Email 為必填";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "請輸入有效的 Email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    submitMutation.mutate(form);
  };

  const handleChange = (key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  // ── 報名已截止提示 ──────────────────────────────────────────────────────────
  // ── 截止日期提醒卡片 ──────────────────────────────────────────────────────────
  // 僅在報名開放且有設定截止日期時顯示
  const DeadlineReminder = () => {
    const deadline = registrationStatus?.deadline;
    if (!deadline || isClosed) return null;

    const deadlineDate = new Date(`${deadline}T23:59:59+08:00`);
    const now = Date.now();
    const diffMs = deadlineDate.getTime() - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const displayDate = deadlineDate.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      timeZone: "Asia/Taipei",
    });

    const isUrgent = diffDays <= 3;

    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
        style={{
          background: isUrgent ? "rgba(239,68,68,0.07)" : "rgba(30,92,58,0.06)",
          border: `1.5px solid ${isUrgent ? "rgba(239,68,68,0.25)" : "rgba(30,92,58,0.18)"}`,
        }}
      >
        <Clock
          className="w-4 h-4 flex-shrink-0"
          style={{ color: isUrgent ? "#dc2626" : "var(--green-primary)" }}
        />
        <div className="flex-1 min-w-0">
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: isUrgent ? "#dc2626" : "var(--green-deep)",
            }}
          >
            {isUrgent ? "即將截止！" : "報名截止日期"}
          </span>
          <span
            className="ml-2"
            style={{ fontSize: "0.875rem", color: isUrgent ? "#b91c1c" : "var(--text-mid)" }}
          >
            {displayDate}（{diffDays > 0 ? `還有 ${diffDays} 天` : "今日截止"}）
          </span>
        </div>
      </div>
    );
  };

  const ClosedNotice = () => {
    const isFull = registrationStatus?.isFull ?? false;
    return (
      <div className="text-center py-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(239,68,68,0.08)" }}
        >
          <BanIcon className="w-10 h-10" style={{ color: "#dc2626" }} />
        </div>
        <h3
          className="text-2xl font-bold mb-3"
          style={{ color: "var(--green-deep)", fontFamily: "'Noto Serif TC', serif" }}
        >
          {isFull ? "報名已額滿" : "報名已截止"}
        </h3>
        <p className="mb-2" style={{ fontSize: "0.9375rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
          感謝您對「環境醫生實務研討會」的關注
        </p>
        <p className="mb-6" style={{ fontSize: "0.875rem", color: "var(--text-light)", lineHeight: 1.7 }}>
          {isFull
            ? "本活動報名人數上限 30 人，目前已額滿！感謝您的熱烈支持。"
            : "本次活動報名已截止，如有疑問請聯繫主辦單位。"}
        </p>
      <div
        className="px-6 py-4 rounded-xl space-y-2"
        style={{ background: "var(--green-pale)", border: "1.5px solid rgba(30,92,58,0.15)" }}
      >
        <p className="font-semibold mb-2" style={{ fontSize: "0.875rem", color: "var(--green-deep)" }}>
          活動資訊
        </p>
        <div className="flex items-center justify-center gap-2">
          <CalendarDays className="w-4 h-4" style={{ color: "var(--green-primary)" }} />
          <span style={{ fontSize: "0.875rem", color: "var(--text-mid)" }}>2026 年 8 月 6 日（週四）</span>
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: 900,
              color: "var(--green-primary)",
              letterSpacing: "0.04em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            16:00–18:00
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: "var(--green-primary)" }} />
          <span style={{ fontSize: "0.875rem", color: "var(--text-mid)" }}>
            台中 TOP1 環球經貿中心頂樓交誼廳
          </span>
        </div>
      </div>
      <p className="mt-6" style={{ fontSize: "0.8125rem", color: "var(--text-light)" }}>
        主辦單位：全球華人智慧健康產業發展協會（GSHA）
      </p>
    </div>
  );
};

  // ── 報名成功提示 ──────────────────────────────────────────────────────────
  const SuccessNotice = () => (
    <div className="text-center py-8">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: "var(--green-pale)" }}
      >
        <CheckCircle2 className="w-10 h-10" style={{ color: "var(--green-accent)" }} />
      </div>
      <h3
        className="text-2xl font-bold mb-3"
        style={{ color: "var(--green-deep)", fontFamily: "'Noto Serif TC', serif" }}
      >
        報名成功！
      </h3>
      <p className="mb-2" style={{ fontSize: "0.9375rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
        感謝您報名「環境醫生實務研討會」
      </p>
      <p className="mb-6" style={{ fontSize: "0.875rem", color: "var(--text-light)", lineHeight: 1.7 }}>
        我們將於活動前以 Email 發送確認通知，敬請留意信箱。
      </p>
      <div
        className="px-6 py-4 rounded-xl text-center"
        style={{ background: "var(--green-pale)", border: "1.5px solid rgba(30,92,58,0.15)" }}
      >
        <p className="font-semibold mb-2" style={{ fontSize: "0.875rem", color: "var(--green-deep)" }}>
          活動資訊
        </p>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span style={{ fontSize: "0.875rem", color: "var(--text-mid)" }}>📅 2026 年 8 月 6 日（週四）</span>
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: 900,
              color: "var(--green-primary)",
              letterSpacing: "0.04em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            16:00–18:00
          </span>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-mid)" }}>
          📍 台中 TOP1 環球經貿中心頂樓交誼廳
        </p>
      </div>
      <button
        onClick={() => setSubmitted(false)}
        className="mt-6 text-sm underline"
        style={{ color: "var(--green-primary)" }}
      >
        再次報名
      </button>
    </div>
  );

  // ── 報名表單 ──────────────────────────────────────────────────────────────
  const RegisterForm = () => (
    <>
      <DeadlineReminder />
      <div className="mb-6">
        <h3
          className="font-bold mb-1"
          style={{ fontSize: "1.125rem", color: "var(--green-deep)", fontFamily: "'Noto Serif TC', serif" }}
        >
          線上報名表單
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--text-light)", lineHeight: 1.7 }}>
          請填寫以下資料完成報名，所有欄位均為必填。<br />
          <span className="font-semibold text-red-600">※ 本活動因場地席次有限，限額 30 人，額滿即截止報名。</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key} className={field.key === "email" ? "sm:col-span-2" : ""}>
              <label
                className="block font-semibold mb-1.5"
                style={{ fontSize: "0.875rem", color: "var(--text-mid)" }}
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <field.icon className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                </div>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all duration-200"
                  style={{
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                    border: errors[field.key] ? "1.5px solid #e53e3e" : "1.5px solid rgba(30,92,58,0.15)",
                    background: errors[field.key] ? "rgba(229,62,62,0.03)" : "rgba(248,252,250,0.8)",
                    color: "var(--text-dark)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1.5px solid var(--green-primary)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,92,58,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = errors[field.key]
                      ? "1.5px solid #e53e3e"
                      : "1.5px solid rgba(30,92,58,0.15)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              {errors[field.key] && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-500">{errors[field.key]}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ fontSize: "0.8125rem", color: "var(--text-light)", lineHeight: 1.7 }}>
          您的個人資料僅用於本次活動報名確認與聯繫，不會用於其他用途。
        </p>

        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            fontSize: "clamp(0.9375rem, 2vw, 1.0625rem)",
            background: submitMutation.isPending
              ? "var(--green-medium)"
              : "linear-gradient(135deg, #1e5c3a, #34a85a)",
            boxShadow: "0 8px 24px rgba(30,92,58,0.3)",
          }}
        >
          {submitMutation.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              送出中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              確認送出報名
            </>
          )}
        </button>
      </form>
    </>
  );

  return (
    <section
      id="register"
      className="relative py-10 lg:py-14 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, var(--green-deep) 0%, var(--green-primary) 60%, var(--green-medium) 100%)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container relative z-10">
        {/* Closing statement */}
        <div className="text-center mb-12">
          <p className="text-label mb-3" style={{ color: "#7dd3a8" }}>Register Now</p>
          <h2
            className="text-white mb-4 leading-tight"
            style={{
              fontFamily: "'Noto Serif TC', serif",
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 700,
            }}
          >
            從取得證照到營運守護，
            <br className="hidden sm:block" />
            建立可檢測、可改善、可認證的完整服務鏈
          </h2>
          <p style={{ fontSize: "clamp(0.9375rem, 2vw, 1.0625rem)", color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}>
            掌握實務解方，打造健康、節能、永續的空間環境！
          </p>
        </div>

        {/* Form card */}
        <div className="max-w-2xl mx-auto">
          <div
            className="bg-white rounded-2xl p-7 sm:p-9 shadow-2xl"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}
          >
            {isClosed ? (
              ClosedNotice()
            ) : submitted ? (
              SuccessNotice()
            ) : (
              RegisterForm()
            )}
          </div>

          <div className="mt-6 text-center">
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
              活動日期：2026 年 8 月 6 日（週四）　
              <span
                style={{
                  fontWeight: 900,
                  color: "rgba(125,211,168,0.9)",
                  letterSpacing: "0.04em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                16:00–18:00
              </span>
              <br className="sm:hidden" />
              <span className="hidden sm:inline">　｜　</span>
              台中 TOP1 環球經貿中心頂樓交誼廳
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
