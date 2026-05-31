import { useState, useEffect } from "react";
import { G } from "../styles/theme";
import { HeroSection } from "../components/HeroSection";
import { RouletteSection } from "../components/RouletteSection";
import { BrandSection } from "../components/BrandSection";
import { Footer } from "../components/Footer";
import { useFadeIn } from "../hooks/useFadeIn";

// Homepage view content

export function HomeView({ setPage, onSelectCategory, onViewDetails }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCollectionClick = (catName) => {
    onSelectCategory(catName);
    setPage("catalog");
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ background: G.cream, minHeight: "100vh" }}>
      {/* Glassmorphic Navigation Header */}
      <header className={`glass-header ${scrolled ? "scrolled" : ""}`}>
        <div
          className="nav-logo serif"
          style={{
            fontSize: "26px",
            fontWeight: 500,
            color: G.textDark,
            cursor: "pointer",
            letterSpacing: "1px"
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Dorella <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: G.gold }}>Jewelry</span>
        </div>

        {/* Desktop Links */}
        <nav className="nav-links-desktop" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <span className="nav-item" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Inicio</span>
          <span className="nav-item" onClick={() => scrollToSection("brand")}>Historia</span>
          <span className="nav-item" onClick={() => scrollToSection("roulette-showcase")}>Colecciones</span>
          <span className="nav-item" onClick={() => setPage("catalog")}>Catálogo</span>
          <button
            className="nav-cta"
            onClick={() => {
              onSelectCategory("Todos");
              setPage("catalog");
            }}
          >
            Comprar
          </button>
        </nav>

        {/* Hamburger Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: "24px",
            color: G.textDark,
            cursor: "pointer",
          }}
          className="hamburger-btn"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Mobile Header CSS toggle */}
        <style>{`
          @media (max-width: 768px) {
            .hamburger-btn { display: block !important; }
          }
        `}</style>
      </header>

      {/* Mobile Nav Drawer */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
          visibility: mobileMenuOpen ? "visible" : "hidden",
          transition: "visibility 0.4s",
        }}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            opacity: mobileMenuOpen ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Sidebar Panel (Slide out from right) */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "320px",
            maxWidth: "85%",
            background: "rgba(10, 9, 9, 0.95)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
            borderLeft: `1px solid rgba(201, 168, 76, 0.25)`,
            display: "flex",
            flexDirection: "column",
            padding: "40px 24px",
            transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.6)",
          }}
        >
          <style>{`
            .mobile-menu-item {
              color: ${G.textDark};
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 2px;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              position: relative;
              padding: 16px 12px;
              display: flex;
              align-items: center;
              border-bottom: 1px solid rgba(201, 168, 76, 0.08);
              font-family: 'Jost', sans-serif;
            }
            .mobile-menu-item:hover {
              color: ${G.goldLight};
              background: rgba(201, 168, 76, 0.04);
              padding-left: 20px;
            }
            .mobile-menu-number {
              color: ${G.gold};
              font-size: 10px;
              font-family: 'Cormorant Garamond', serif;
              margin-right: 12px;
              font-weight: 600;
              opacity: 0.8;
            }
          `}</style>

          {/* Close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              alignSelf: "flex-end",
              background: "none",
              border: "none",
              color: G.textDark,
              fontSize: "24px",
              cursor: "pointer",
              marginBottom: "30px",
              padding: "4px 8px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = G.gold}
            onMouseLeave={(e) => e.currentTarget.style.color = G.textDark}
          >
            ✕
          </button>

          {/* Logo brand */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p className="serif" style={{ fontSize: "32px", color: G.gold, fontWeight: 500, lineHeight: 1, letterSpacing: "1px" }}>
              Dorella
            </p>
            <span style={{ fontSize: "9px", letterSpacing: "5px", textTransform: "uppercase", color: G.textMuted }}>
              Jewelry
            </span>
            <div style={{ width: "30px", height: "1px", background: G.gold, margin: "16px auto 0", opacity: 0.5 }} />
          </div>

          {/* Navigation Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              className="mobile-menu-item"
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
            >
              <span className="mobile-menu-number">01</span> Inicio
            </span>
            <span
              className="mobile-menu-item"
              onClick={() => { scrollToSection("brand"); setMobileMenuOpen(false); }}
            >
              <span className="mobile-menu-number">02</span> Historia
            </span>
            <span
              className="mobile-menu-item"
              onClick={() => { scrollToSection("roulette-showcase"); setMobileMenuOpen(false); }}
            >
              <span className="mobile-menu-number">03</span> Colecciones
            </span>
            <span
              className="mobile-menu-item"
              onClick={() => { onSelectCategory("Todos"); setPage("catalog"); setMobileMenuOpen(false); }}
            >
              <span className="mobile-menu-number">04</span> Catálogo
            </span>
          </div>

          {/* Action button inside sidebar */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            <button
              className="gold-btn"
              style={{
                width: "100%",
                boxShadow: `0 4px 20px rgba(201, 168, 76, 0.15)`,
                fontSize: "11px",
                padding: "12px 24px"
              }}
              onClick={() => { onSelectCategory("Todos"); setPage("catalog"); setMobileMenuOpen(false); }}
            >
              Comprar Ahora
            </button>
            <span style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: G.textMuted, textAlign: "center" }}>
              Oro 18K Laminado Exclusivo
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section (First Scroll) */}
      <HeroSection onExplore={() => { onSelectCategory("Todos"); setPage("catalog"); }} />

      {/* Roulette Showcase Section (Second Scroll) */}
      <RouletteSection onViewDetails={onViewDetails} />

      {/* Brand Narrative Section */}
      <BrandSection id="brand" />

      {/* Footer */}
      <Footer />

      {/* Acceso Admin */}
      <div
        onClick={() => setPage("admin")}
        style={{
          textAlign: "center",
          padding: "12px",
          background: G.black,
          fontSize: "10px",
          color: "rgba(255,255,255,0.25)",
          cursor: "pointer",
          letterSpacing: "1px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        Admin Panel Access
      </div>
    </div>
  );
}
