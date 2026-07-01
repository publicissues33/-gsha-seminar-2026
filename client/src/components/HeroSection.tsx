import { Calendar, MapPin, ChevronDown, Users } from "lucide-react";
import { useState, useEffect } from "react";

function useCountdown(targetDate: Date) {
  const calc = () => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, expired: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// 活動目標時間：2026/8/6 16:00 台灣時間 (UTC+8)
const EVENT_DATE = new Date("2026-08-06T16:00:00+08:00");

function CountdownTimer() {
  const { days, hours, minutes, seconds, expired } = useCountdown(EVENT_DATE);

  if (expired) {
    return (
      <div
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl"
        style={{
          background: "rgba(52,168,90,0.2)",
          border: "1.5px solid rgba(125,211,168,0.4)",
        }}
      >
        <span style={{ fontSize: "1rem", fontWeight: 700, color: "#7dd3a8" }}>活動已開始！歡迎蒞臨</span>
      </div>
    );
  }

  const units = [
    { label: "天", value: days },
    { label: "時", value: hours },
    { label: "分", value: minutes },
    { label: "秒", value: seconds },
  ];

  return (
    <div>
      <p
        className="mb-3"
        style={{ fontSize: "0.8125rem", color: "rgba(125,211,168,0.8)", letterSpacing: "0.12em", fontWeight: 600 }}
      >
        距離活動開始還有
      </p>
      <div className="flex items-end gap-2 sm:gap-3">
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-end gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: "clamp(52px, 10vw, 72px)",
                  height: "clamp(52px, 10vw, 72px)",
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(125,211,168,0.35)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(1.375rem, 4vw, 2rem)",
                    fontWeight: 900,
                    color: "#e6f7ef",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    fontFamily: "'Noto Sans TC', sans-serif",
                  }}
                >
                  {String(value).padStart(2, "0")}
                </span>
              </div>
              <span
                className="mt-1.5"
                style={{ fontSize: "0.75rem", color: "rgba(125,211,168,0.75)", fontWeight: 600, letterSpacing: "0.08em" }}
              >
                {label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span
                className="mb-5"
                style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 900, color: "rgba(125,211,168,0.5)", lineHeight: 1 }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const painPoints = [
  "室內設計公司：空間交付後，客戶反映發霉、異味問題，影響口碑？",
  "精品品牌：皮革、織品商品在展示空間受潮損壞，損失難以估算？",
  "通路商：賣場環境悶熱、顧客體驗差，空調費用卻居高不下？",
  "空調工程公司：低溫長轉仍無法解決問題，節能與舒適兩難兼顧？",
];

export default function HeroSection() {
  const scrollToRegister = () => {
    const el = document.getElementById("register");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, var(--green-deep) 0%, var(--green-primary) 45%, var(--green-medium) 100%)",
      }}
    >
      {/* Geometric decorative lines */}
      <div className="geo-lines" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Radial glows */}
      <div
        className="absolute top-20 right-0 w-96 h-96 opacity-10"
        style={{ background: "radial-gradient(circle, rgba(52,168,90,0.6) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 opacity-10"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.6) 0%, transparent 70%)" }}
      />

      {/* SVG geometric decoration */}
      <svg
        className="absolute right-0 top-0 h-full opacity-5"
        viewBox="0 0 400 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <polygon points="400,0 400,800 100,800" fill="white" />
        <line x1="400" y1="0" x2="100" y2="800" stroke="white" strokeWidth="1" />
        <line x1="400" y1="200" x2="200" y2="800" stroke="white" strokeWidth="0.5" />
        <circle cx="350" cy="200" r="80"  stroke="white" strokeWidth="0.5" fill="none" />
        <circle cx="350" cy="200" r="140" stroke="white" strokeWidth="0.3" fill="none" />
      </svg>

      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-4xl">

          {/* ── 主辦單位 + 年度標籤（最頂部，分開排列） ── */}
          <div className="flex flex-wrap gap-3 mb-6 fade-in-up visible">
            {/* 主辦單位 badge */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <div
                className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: "white", padding: "1px" }}
              >
                <img
                  src="/GSHA.jpg"
                  alt="GSHA"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-badge" style={{ color: "rgba(200,240,215,0.9)", letterSpacing: "0.06em" }}>
                主辦單位：全球華人智慧健康產業發展協會（GSHA）
              </span>
            </div>

            {/* 年度標籤 badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-badge text-green-100">2026 年度專業研討會</span>
            </div>
          </div>

          {/* ── Main title：單行 ── */}
          <h1
            className="text-white mb-3 fade-in-up visible whitespace-nowrap"
            style={{
              fontFamily: "'Noto Serif TC', serif",
              fontSize: "clamp(2rem, 5.5vw, 3.75rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              animationDelay: "0.1s",
            }}
          >
            環境醫生 <span style={{ color: "#7dd3a8" }}>實務研討會</span>
          </h1>

          {/* ── Subtitle：單行 ── */}
          <p
            className="fade-in-up visible mb-8 whitespace-nowrap"
            style={{
              animationDelay: "0.2s",
              fontSize: "clamp(0.875rem, 2.2vw, 1.25rem)",
              lineHeight: "1.65",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 400,
            }}
          >
            破解室內防霉與節能兩難：綠建築環境品質最佳化實務
          </p>

          {/* ── Countdown Timer & Limit Reminder ── */}
          <div className="mb-8 fade-in-up visible flex flex-col sm:flex-row sm:items-end gap-4" style={{ animationDelay: "0.3s" }}>
            <CountdownTimer />
            
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl self-start sm:self-auto sm:mb-1"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <Users className="w-4 h-4 text-red-300 flex-shrink-0" />
              <span className="text-red-100 font-bold" style={{ fontSize: "0.9375rem" }}>
                限額 30 人（額滿即截止）
              </span>
            </div>
          </div>

          {/* Event info pills */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-10 fade-in-up visible"
            style={{ animationDelay: "0.4s" }}
          >
            <div
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl"
              style={{
                background: "rgba(52,168,90,0.25)",
                border: "1.5px solid rgba(125,211,168,0.5)",
                boxShadow: "0 0 16px rgba(52,168,90,0.2)",
              }}
            >
              <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: "#7dd3a8" }} />
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#e6f7ef", letterSpacing: "0.02em" }}>
                2026 年 8 月 6 日（週四）
              </span>
              <span
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 900,
                  color: "#7dd3a8",
                  letterSpacing: "0.04em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                16:00–18:00
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <MapPin className="w-4 h-4 text-green-300 flex-shrink-0" />
              <span className="text-white font-medium" style={{ fontSize: "0.9375rem" }}>
                台中 TOP1 環球經貿中心頂樓交誼廳
              </span>
            </div>
          </div>

          {/* Pain points */}
          <div className="mb-10 fade-in-up visible" style={{ animationDelay: "0.4s" }}>
            <p
              className="text-badge mb-3"
              style={{ color: "#7dd3a8", letterSpacing: "0.1em" }}
            >
              您是否也面臨這些困境？
            </p>
            <div className="grid gap-2.5">
              {painPoints.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ background: "rgba(52,168,90,0.4)", color: "#7dd3a8" }}
                  >
                    {i + 1}
                  </span>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      lineHeight: "1.7",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="fade-in-up visible" style={{ animationDelay: "0.5s" }}>
            <button
              onClick={scrollToRegister}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-white transition-all duration-200 active:scale-95 btn-pulse text-cta"
              style={{
                background: "linear-gradient(135deg, #34a85a, #1e5c3a)",
                boxShadow: "0 8px 32px rgba(52,168,90,0.4)",
              }}
            >
              立即報名：掌握綠建築環境品質實務解方
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span style={{ fontSize: "0.75rem", color: "white" }}>向下捲動</span>
        <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
