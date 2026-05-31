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

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: G.black,
            zIndex: 980,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "28px",
          }}
        >
          <span 
            style={{ color: G.textDark, fontSize: "20px", textTransform: "uppercase", letterSpacing: "2px", cursor: "pointer" }}
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
          >
            Inicio
          </span>
          <span 
            style={{ color: G.textDark, fontSize: "20px", textTransform: "uppercase", letterSpacing: "2px", cursor: "pointer" }}
            onClick={() => scrollToSection("brand")}
          >
            Historia
          </span>
          <span 
            style={{ color: G.textDark, fontSize: "20px", textTransform: "uppercase", letterSpacing: "2px", cursor: "pointer" }}
            onClick={() => scrollToSection("roulette-showcase")}
          >
            Colecciones
          </span>
          <span 
            style={{ color: G.textDark, fontSize: "20px", textTransform: "uppercase", letterSpacing: "2px", cursor: "pointer" }}
            onClick={() => { onSelectCategory("Todos"); setPage("catalog"); }}
          >
            Catálogo
          </span>
          <button 
            className="gold-btn"
            style={{ marginTop: "12px" }}
            onClick={() => { onSelectCategory("Todos"); setPage("catalog"); }}
          >
            Comprar Ahora
          </button>
        </div>
      )}

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
