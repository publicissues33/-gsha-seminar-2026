import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "關於活動", href: "#hero" },
  { label: "主要嘉賓", href: "#dean-avatar" },
  { label: "議程總覽", href: "#agenda" },
  { label: "核心痛點", href: "#problem" },
  { label: "實務解方", href: "#solution" },
  { label: "立即報名", href: "#register", isCta: false },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("register");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      if (id === "dean-avatar") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 navbar-blur"
      style={{
        background: scrolled ? "rgba(26,61,43,0.97)" : "rgba(26,61,43,0.88)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.2)" : "none",
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
            className="flex items-center gap-2.5 group"
          >
            {/* GSHA LOGO */}
            <div
              className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ background: "white", padding: "2px" }}
            >
              <img
                src="/GSHA.jpg"
                alt="GSHA"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-sm leading-tight hidden sm:block text-white"
              style={{ fontFamily: "'Noto Serif TC', serif" }}>
              環境醫生<br />
              <span className="text-xs font-normal" style={{ color: "rgba(200,240,215,0.75)" }}>實務研討會</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={scrollToRegister}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all duration-200 active:scale-95"
            style={{ background: "linear-gradient(135deg, #34a85a, #1e5c3a)", boxShadow: "0 4px 16px rgba(52,168,90,0.35)" }}
          >
            立即報名
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "white", background: "rgba(255,255,255,0.1)" }}
            aria-label="開啟選單"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ background: "rgba(22,52,36,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="container py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={scrollToRegister}
            className="mt-2 px-4 py-3 rounded-full text-sm font-semibold text-white text-center"
            style={{ background: "linear-gradient(135deg, #1e5c3a, #34a85a)" }}
          >
            立即報名 →
          </button>
        </div>
      </div>
    </nav>
  );
}
