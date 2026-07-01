import { Clock, Mic, Users, MessageSquare, UserCheck } from "lucide-react";

const agendaItems = [
  {
    time: "16:00–16:30",
    title: "報到 Registration",
    speakers: [],
    icon: UserCheck,
    type: "registration",
    description: "現場報到、交流",
  },
  {
    time: "16:30–16:50",
    title: "致詞",
    speakers: [
      { name: "簡碩賢", role: "理事長 / 總經理", initial: "簡" },
      { name: "郭守仁 醫師", role: "創會理事長", initial: "郭" },
    ],
    icon: Mic,
    type: "speech",
    description: "開幕致詞，闡述本次研討會核心主旨",
  },
  {
    time: "16:50–17:20",
    title: "綠建築環境品質整合解決方案",
    speakers: [{ name: "Shaun", role: "智森永續設計方案總監", initial: "S" }],
    icon: Users,
    type: "keynote",
    description: "從評估到管理，智森（RCI）如何成為環境品質的翻譯者與管理者",
  },
  {
    time: "17:20–17:50",
    title: "室內防霉與空調節能的解決方案",
    speakers: [{ name: "陳睿麒", role: "泉康科技 總經理", initial: "陳" }],
    icon: Users,
    type: "keynote",
    description: "WETOP PICT 技術實務應用：打斷發霉與耗能的惡性循環",
  },
  {
    time: "17:50–18:00",
    title: "問題討論",
    speakers: [],
    icon: MessageSquare,
    type: "qa",
    description: "開放與會者提問，專家現場解答",
  },
];

const typeConfig: Record<string, {
  nodeColor: string;
  nodeBorder: string;
  timeBg: string;
  timeColor: string;
  cardBg: string;
  cardBorder: string;
  speakerBg: string;
}> = {
  registration: {
    nodeColor: "#94a3b8",
    nodeBorder: "#cbd5e1",
    timeBg: "rgba(148,163,184,0.12)",
    timeColor: "#64748b",
    cardBg: "rgba(248,250,252,0.9)",
    cardBorder: "rgba(148,163,184,0.25)",
    speakerBg: "rgba(148,163,184,0.1)",
  },
  speech: {
    nodeColor: "#c9a84c",
    nodeBorder: "#e8d08a",
    timeBg: "rgba(201,168,76,0.12)",
    timeColor: "#a07c28",
    cardBg: "rgba(255,252,240,0.9)",
    cardBorder: "rgba(201,168,76,0.28)",
    speakerBg: "rgba(201,168,76,0.1)",
  },
  keynote: {
    nodeColor: "#1e5c3a",
    nodeBorder: "#34a85a",
    timeBg: "rgba(30,92,58,0.1)",
    timeColor: "#1e5c3a",
    cardBg: "rgba(248,253,250,0.95)",
    cardBorder: "rgba(30,92,58,0.2)",
    speakerBg: "rgba(30,92,58,0.07)",
  },
  qa: {
    nodeColor: "#34a85a",
    nodeBorder: "#6dd08a",
    timeBg: "rgba(52,168,90,0.1)",
    timeColor: "#1e7a40",
    cardBg: "rgba(248,253,250,0.9)",
    cardBorder: "rgba(52,168,90,0.22)",
    speakerBg: "rgba(52,168,90,0.08)",
  },
};

export default function AgendaSection() {
  return (
    <section id="agenda" className="py-10 lg:py-14 bg-white">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-8">
          <p className="text-label mb-3">Agenda</p>
          <h2 className="text-section-title section-heading inline-block">
            研討會議程
          </h2>
          <div className="mt-5 flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl" style={{ background: "rgba(30,92,58,0.08)", border: "1.5px solid rgba(30,92,58,0.2)" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--green-deep)" }}>2026 年 8 月 6 日（週四）</span>
              <span style={{ fontSize: "1.0625rem", fontWeight: 900, color: "var(--green-primary)", letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums" }}>16:00–18:00</span>
            </div>
          </div>
        </div>

        {/* Timeline container */}
        <div className="max-w-4xl mx-auto">
          {agendaItems.map((item, i) => {
            const cfg = typeConfig[item.type];
            const Icon = item.icon;
            const isLast = i === agendaItems.length - 1;

            return (
              <div key={i} className="flex gap-0 sm:gap-2">

                {/* ── Left: Timeline column ── */}
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: "48px" }}>
                  {/* Node dot */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm"
                    style={{
                      background: cfg.nodeColor,
                      border: `3px solid ${cfg.nodeBorder}`,
                    }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className="flex-1 w-0.5 my-1"
                      style={{
                        background: `linear-gradient(to bottom, ${cfg.nodeBorder}, rgba(148,163,184,0.2))`,
                        minHeight: "24px",
                      }}
                    />
                  )}
                </div>

                {/* ── Right: Card ── */}
                <div
                  className={`flex-1 rounded-2xl overflow-hidden mb-4 transition-all duration-200 card-hover ${isLast ? "" : ""}`}
                  style={{
                    background: cfg.cardBg,
                    border: `1px solid ${cfg.cardBorder}`,
                    marginLeft: "12px",
                  }}
                >
                  {/* Card inner: two-column on sm+ */}
                  <div className="grid sm:grid-cols-[1fr_210px] sm:items-center">

                    {/* ── Card Left: title + description ── */}
                    <div className="p-5 pr-4 flex flex-col justify-center">
                      {/* Time badge — visible only on mobile (top of left col) */}
                      <div className="sm:hidden mb-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                          style={{
                            background: cfg.timeBg,
                            color: cfg.timeColor,
                            fontWeight: 900,
                            fontSize: "0.9375rem",
                            letterSpacing: "0.04em",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          {item.time}
                        </span>
                      </div>

                      <h3
                        className="font-bold leading-snug mb-2"
                        style={{
                          fontSize: "clamp(1.0625rem, 2.2vw, 1.25rem)",
                          color: "var(--green-deep)",
                          fontFamily: "'Noto Serif TC', serif",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "1rem",
                          lineHeight: "1.7",
                          color: "#555555",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* ── Card Right: time + speakers ── */}
                    <div
                      className="hidden sm:flex flex-col items-center gap-3 p-4 pl-4 border-l justify-center"
                      style={{ borderColor: cfg.cardBorder }}
                    >
                      {/* Time badge — filled, no border */}
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg w-full justify-center"
                        style={{
                          background: cfg.timeBg,
                          color: cfg.timeColor,
                          fontWeight: 900,
                          fontSize: "1.0625rem",
                          letterSpacing: "0.05em",
                          fontVariantNumeric: "tabular-nums",
                          boxShadow: `0 2px 8px ${cfg.timeBg}88`,
                        }}
                      >
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        {item.time}
                      </span>

                      {/* Speakers */}
                      {item.speakers.length > 0 && (
                        <div className="flex flex-col gap-1.5 w-full">
                          {item.speakers.map((speaker, j) => (
                            <div
                              key={j}
                              className="px-3 py-2 rounded-xl"
                              style={{ background: cfg.speakerBg }}
                            >
                              <p
                                className="font-bold leading-tight"
                                style={{
                                  fontSize: "1rem",
                                  color: "var(--green-deep)",
                                  fontFamily: "'Noto Serif TC', serif",
                                }}
                              >
                                {speaker.name}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "#666666",
                                  lineHeight: 1.5,
                                  marginTop: "2px",
                                }}
                              >
                                {speaker.role}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mobile speakers row */}
                    {item.speakers.length > 0 && (
                      <div className="sm:hidden flex flex-wrap gap-2 px-5 pb-4">
                        {item.speakers.map((speaker, j) => (
                          <div
                            key={j}
                            className="px-2.5 py-1.5 rounded-lg"
                            style={{ background: cfg.speakerBg }}
                          >
                            <p
                              className="font-bold leading-tight"
                              style={{
                                fontSize: "0.9375rem",
                                color: "var(--green-deep)",
                                fontFamily: "'Noto Serif TC', serif",
                              }}
                            >
                              {speaker.name}
                            </p>
                            <p style={{ fontSize: "0.8125rem", color: "#666666", marginTop: "2px" }}>
                              {speaker.role}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
