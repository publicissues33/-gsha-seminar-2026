import { Search, BarChart2, Settings2 } from "lucide-react";

const rciValues = [
  {
    icon: Search,
    title: "評估同步檢視",
    desc: "確認濕氣滯留與空調配置合理性，在設計階段即發現潛在風險",
    color: "#1e5c3a",
  },
  {
    icon: BarChart2,
    title: "連續數據監測",
    desc: "部署偵測器，掌握日夜濕度與溫差變化，建立可追蹤的環境數據",
    color: "#2d7a4f",
  },
  {
    icon: Settings2,
    title: "營運邏輯改善",
    desc: "提出兼顧節能與防霉的整合方案，將環境品質轉化為可管理的成果",
    color: "#34a85a",
  },
];

export default function ProblemSection() {
  return (
    <section
      id="problem"
      className="py-10 lg:py-14 geo-bg"
      style={{ background: "linear-gradient(180deg, #f0f9f4 0%, #e8f5ee 100%)" }}
    >
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-8">
          <p className="text-label mb-3">The Problem</p>
          <h2 className="text-section-title leading-snug max-w-2xl mx-auto">
            多數空間通過綠建築評估，
            <br className="hidden sm:block" />
            為何營運後仍面臨發霉與客訴？
          </h2>
          <p className="mt-4 text-body max-w-xl mx-auto">
            紙上合格與實際體驗之間，存在一道被忽視的鴻溝
          </p>
        </div>

        {/* Traditional Error Loop Diagram */}
        <div className="max-w-3xl mx-auto mb-12 bg-white rounded-2xl p-6 shadow-md overflow-hidden flex justify-center border border-gray-100">
          <img
            src="/傳統錯誤循環.png"
            alt="傳統錯誤循環圖"
            className="w-full h-auto object-contain rounded-xl"
          />
        </div>



        {/* RCI positioning */}
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-white rounded-2xl p-8 shadow-xl"
            style={{ border: "1px solid rgba(30,92,58,0.1)" }}
          >
            <div className="text-center mb-8">

              <h3 className="text-section-title mb-3">
                智森，不僅協助取得證照，
                <br className="hidden sm:block" />
                更是環境品質的翻譯者與管理者
              </h3>
              <p className="text-body max-w-xl mx-auto">
                將綠建築要求轉化為品牌能夠管理、驗證與決策的環境品質成果
              </p>
            </div>

            {/* Three pillars */}
            <div className="grid sm:grid-cols-3 gap-4">
              {rciValues.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 text-center card-hover"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}08, ${item.color}04)`,
                    border: `1px solid ${item.color}20`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: `${item.color}15` }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <h4 className="text-card-title mb-2">{item.title}</h4>
                  <p className="text-body">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
