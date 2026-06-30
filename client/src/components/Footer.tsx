export default function Footer() {
  return (
    <footer className="py-8 border-t"
      style={{ background: "var(--green-deep)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: "white", padding: "1px" }}>
              <img
                src="/GSHA.jpg"
                alt="GSHA"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">環境醫生實務研討會</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                主辦：全球華人智慧健康產業發展協會（GSHA）
              </p>
            </div>
          </div>
          <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
            © 2026 GSHA. All rights reserved. ｜ 2026.08.06 台中 TOP1 環球經貿中心
          </p>
        </div>
      </div>
    </footer>
  );
}
