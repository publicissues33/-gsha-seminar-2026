import { useState } from "react";
import { Wind, X } from "lucide-react";

export default function SolutionSection() {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <section
      id="solution"
      className="py-10 lg:py-14 bg-white"
    >
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-8">
          <p className="text-label mb-3">The Solution</p>
          <h2 className="text-section-title leading-snug max-w-2xl mx-auto">
            從根源阻斷濕氣：
            <br className="hidden sm:block" />
            室內防霉與空調節能的整合服務解方
          </h2>
        </div>

        {/* Moisture Rebound */}
        <div className="max-w-4xl mx-auto mb-14 bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col">
          <div
            className="px-7 py-5"
            style={{ background: "linear-gradient(135deg, var(--green-deep), var(--green-primary))" }}
          >
            <p className="text-badge text-green-200 uppercase mb-1">回潮效應 Moisture Rebound</p>
            <h3 className="text-xl font-bold text-white leading-snug">
              打斷發霉與耗能的惡性循環
            </h3>
          </div>
          <div className="p-7 flex justify-center bg-white">
            <img
              src="/回潮效應1.png"
              alt="回潮效應"
              onClick={() => setZoomedImage("rebound")}
              className="w-full h-auto object-contain rounded-xl cursor-zoom-in hover:opacity-95 transition-opacity"
            />
          </div>
        </div>

        {/* PICT Technology */}
        <div
          className="max-w-4xl mx-auto mb-14 rounded-2xl p-7 lg:p-9 shadow-md"
          style={{
            background: "linear-gradient(135deg, rgba(30,92,58,0.04), rgba(52,168,90,0.04))",
            border: "1px solid rgba(30,92,58,0.12)",
          }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, var(--green-primary), var(--green-accent))" }}
            >
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-badge uppercase mb-1" style={{ color: "var(--green-accent)" }}>
                WETOP PICT 技術
              </p>
              <h3 className="text-xl font-bold" style={{ color: "var(--green-deep)" }}>
                主動式淨化技術，從根源抑制黴菌生長
              </h3>
            </div>
          </div>
          <div className="flex justify-center bg-white/50 p-4 rounded-xl border border-gray-100">
            <img
              src="/inhibit-mold-growth.png"
              alt="根源抑制黴菌生長"
              onClick={() => setZoomedImage("tech")}
              className="w-full h-auto object-contain rounded-xl cursor-zoom-in hover:opacity-95 transition-opacity"
            />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={zoomedImage === "rebound" ? "/回潮效應1.png" : "/inhibit-mold-growth.png"}
              alt="放大圖示"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2"
              onClick={() => setZoomedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
