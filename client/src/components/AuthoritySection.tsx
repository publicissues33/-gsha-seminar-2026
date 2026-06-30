import { Quote } from "lucide-react";

const currentPositions = [
  "大洸醫院管理顧問有限公司 董事長",
  "中山醫學大學醫學研究所 兼任教授",
  "財團法人 RBI 瑞金抗齡照護研究教育基金會 榮譽董事",
  "財團法人台灣醫療健康產業卓越聯盟基金會 顧問",
];

const education = [
  "1976 年　高雄醫學院醫學系畢業",
  "1980 年　日本東京癌症中心",
  "1988 年　澳洲 Melbourne 大學醫學院外科學系研究員",
  "1989 年　美國伊利諾大學醫學院外科學系研究員",
  "1996 年　英國伯明罕大學醫療管理暨政策中心研究員",
  "2004 年　美國哈佛大學公共衛生學院主管管理課程",
];

const experience = [
  "臺北榮總 外科主治醫師",
  "台中省立醫院 外科主任",
  "彰化基督教醫院 一般外科主任",
  "彰化基督教醫院 外科部主任",
  "彰化基督教醫院 學術副院長兼醫學研究部主任",
  "彰化基督教醫院 副院長、協同總院長、總院長",
];

export default function AuthoritySection() {
  return (
    <section id="authority" className="py-10 lg:py-14" style={{ background: "var(--green-pale)" }}>
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-8">
          <p className="text-label mb-3">Authority</p>
          <h2 className="text-section-title section-heading inline-block">
            環境健康的倡議者與推手
          </h2>
          <p className="mt-6 text-body max-w-2xl mx-auto">
            由醫療與健康產業權威領銜，從醫學視角重新定義空間健康的急迫性
          </p>
        </div>

        {/* Person card */}
        <div className="max-w-5xl mx-auto">
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 20px 60px rgba(26,61,43,0.12)" }}
          >
            <div className="grid lg:grid-cols-5 gap-0">

              {/* ── Left: Photo ── */}
              <div
                className="lg:col-span-2 relative overflow-hidden flex flex-col"
                style={{
                  background: "linear-gradient(160deg, var(--green-deep) 0%, var(--green-primary) 60%, var(--green-medium) 100%)",
                  minHeight: "420px",
                }}
              >
                {/* Subtle geometric overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg viewBox="0 0 300 420" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                    <circle cx="260" cy="60" r="130" stroke="white" strokeWidth="0.5" fill="none" />
                    <circle cx="260" cy="60" r="90"  stroke="white" strokeWidth="0.4" fill="none" />
                    <line x1="0" y1="420" x2="300" y2="0"   stroke="white" strokeWidth="0.4" />
                    <line x1="0" y1="320" x2="300" y2="100" stroke="white" strokeWidth="0.3" />
                  </svg>
                </div>

                {/* Photo — centered on desktop, natural on mobile */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-8 px-6">
                  <div
                    id="dean-avatar"
                    className="rounded-xl overflow-hidden mb-5"
                    style={{
                      width: "100%",
                      maxWidth: "280px",
                      aspectRatio: "4/3",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                      border: "3px solid rgba(255,255,255,0.25)",
                      margin: "0 auto",
                    }}
                  >
                    <img
                      src="/r-02_orig.png"
                      alt="郭守仁醫師"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Name badge */}
                  <div className="text-center">
                    <h3
                      className="text-2xl font-bold text-white mb-1"
                      style={{ fontFamily: "'Noto Serif TC', serif", letterSpacing: "-0.01em" }}
                    >
                      郭守仁 醫師
                    </h3>
                    <p className="text-sm font-medium" style={{ color: "rgba(200,240,215,0.9)" }}>
                      創會理事長
                    </p>
                  </div>

                  {/* GSHA badge */}
                  <div
                    className="mt-4 px-4 py-2 rounded-full text-center w-full max-w-xs"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.22)",
                    }}
                  >
                    <p className="text-xs font-bold text-white tracking-wider">GSHA</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(200,240,215,0.8)" }}>
                      全球華人智慧健康產業發展協會
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Right: Credentials ── */}
              <div className="lg:col-span-3 p-7 lg:p-9 flex flex-col gap-6">

                {/* Current positions */}
                <div>
                  <p
                    className="text-xs font-bold tracking-widest uppercase mb-3 pb-2"
                    style={{
                      color: "var(--green-accent)",
                      borderBottom: "1px solid rgba(30,92,58,0.12)",
                    }}
                  >
                    現　　職
                  </p>
                  <ul className="space-y-2">
                    {currentPositions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--green-accent)" }}
                        />
                        <p className="text-body leading-snug">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Education */}
                <div>
                  <p
                    className="text-xs font-bold tracking-widest uppercase mb-3 pb-2"
                    style={{
                      color: "var(--green-accent)",
                      borderBottom: "1px solid rgba(30,92,58,0.12)",
                    }}
                  >
                    學　　歷
                  </p>
                  <ul className="space-y-1.5">
                    {education.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--green-medium)" }}
                        />
                        <p className="text-body leading-snug">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Experience */}
                <div>
                  <p
                    className="text-xs font-bold tracking-widest uppercase mb-3 pb-2"
                    style={{
                      color: "var(--green-accent)",
                      borderBottom: "1px solid rgba(30,92,58,0.12)",
                    }}
                  >
                    重要經歷
                  </p>
                  <ul className="space-y-1.5">
                    {experience.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--green-light)" }}
                        />
                        <p className="text-body leading-snug">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quote */}
                <div className="quote-block rounded-xl p-5 relative">
                  <Quote
                    className="w-7 h-7 mb-2 opacity-25"
                    style={{ color: "var(--green-primary)" }}
                  />
                  <blockquote className="text-quote">
                    「健康不只存在於醫療體系，更存在於我們每天呼吸與生活的空間之中。我們必須以『環境醫生』的角度，重新檢視建築空間的健康體質。」
                  </blockquote>
                  <p className="mt-3 text-sm font-semibold" style={{ color: "var(--green-primary)" }}>
                    — 郭守仁 醫師
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
