import { useState, useEffect } from "react";
import { G } from "../../styles/theme";

export function HomeNavbar({ onNavigate, onSelectCategory }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 990,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "14px 48px" : "24px 48px",
          background: scrolled ? "rgba(10, 9, 9, 0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(201, 168, 76, 0.15)" : "1px solid transparent",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            lineHeight: 1,
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span
            className="serif"
            style={{
              fontSize: "26px",
              fontWeight: 500,
              color: G.textDark,
              letterSpacing: "1.5px",
            }}
          >
            Dorella
          </span>
          <span
            style={{
              fontSize: "8px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: G.gold,
              fontWeight: 600,
              marginTop: "3px",
            }}
          >
            Jewelry
          </span>
        </div>

        {/* Desktop Links */}
        <nav
          className="nav-links-desktop"
          style={{
            display: "flex",
            gap: "36px",
            alignItems: "center",
          }}
        >
          <span
            className="nav-link-item"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Inicio
          </span>
          <span
            className="nav-link-item"
            onClick={() => scrollToSection("craftsmanship")}
          >
            Ingeniería 18K
          </span>
          <span
            className="nav-link-item"
            onClick={() => scrollToSection("editorial-collections")}
          >
            Colecciones
          </span>
          <span
            className="nav-link-item"
            onClick={() => scrollToSection("brand-narrative")}
          >
            Historia
          </span>
          <span
            className="nav-link-item"
            onClick={() => onNavigate("catalog")}
          >
            Catálogo
          </span>

          {/* Enlace telefónico directo (SEO Local / NAP) */}
          <a
            href="tel:+573132403081"
            className="nav-phone-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: G.textDark,
              fontSize: "12px",
              fontWeight: 500,
              textDecoration: "none",
              padding: "7px 14px",
              borderRadius: "20px",
              border: `1px solid ${G.gold}50`,
              background: "rgba(201, 168, 76, 0.08)",
              transition: "all 0.25s ease",
            }}
            title="Llamar a atención al cliente Dorella Jewelry"
          >
            <span>📞</span>
            <span>+57 313 240 3081</span>
          </a>

          {/* CTA Button */}
          <button
            className="nav-gold-cta"
            onClick={() => {
              onSelectCategory("Todos");
              onNavigate("catalog");
            }}
          >
            Comprar
          </button>
        </nav>

        {/* Mobile Hamburger Icon */}
        <button
          className="mobile-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
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
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            opacity: mobileMenuOpen ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Sidebar Drawer */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "320px",
            maxWidth: "85%",
            background: "rgba(10, 9, 9, 0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderLeft: "1px solid rgba(201, 168, 76, 0.2)",
            display: "flex",
            flexDirection: "column",
            padding: "36px 28px",
            transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              alignSelf: "flex-end",
              background: "none",
              border: "none",
              color: G.textDark,
              fontSize: "22px",
              cursor: "pointer",
              marginBottom: "32px",
            }}
          >
            ✕
          </button>

          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <p
              className="serif"
              style={{
                fontSize: "30px",
                color: G.gold,
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              Dorella
            </p>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: G.textMuted,
              }}
            >
              Jewelry
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span
              className="mobile-drawer-item"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileMenuOpen(false);
              }}
            >
              <span className="drawer-num">01</span> Inicio
            </span>
            <span
              className="mobile-drawer-item"
              onClick={() => {
                scrollToSection("craftsmanship");
              }}
            >
              <span className="drawer-num">02</span> Ingeniería 18K
            </span>
            <span
              className="mobile-drawer-item"
              onClick={() => {
                scrollToSection("editorial-collections");
              }}
            >
              <span className="drawer-num">03</span> Colecciones
            </span>
            <span
              className="mobile-drawer-item"
              onClick={() => {
                scrollToSection("brand-narrative");
              }}
            >
              <span className="drawer-num">04</span> Historia
            </span>
            <span
              className="mobile-drawer-item"
              onClick={() => {
                onNavigate("catalog");
                setMobileMenuOpen(false);
              }}
            >
              <span className="drawer-num">05</span> Catálogo
            </span>
          </div>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
            <a
              href="tel:+573132403081"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "2px",
                border: `1px solid ${G.gold}50`,
                color: G.goldLight,
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 500,
                background: "rgba(201, 168, 76, 0.08)",
              }}
            >
              <span>📞 Llamar: +57 313 240 3081</span>
            </a>
            <button
              className="gold-btn"
              style={{
                width: "100%",
                fontSize: "12px",
                padding: "14px 24px",
                boxShadow: "0 4px 20px rgba(201, 168, 76, 0.2)",
              }}
              onClick={() => {
                onSelectCategory("Todos");
                onNavigate("catalog");
                setMobileMenuOpen(false);
              }}
            >
              Comprar Ahora
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .nav-link-item {
          color: ${G.textMid};
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.3s ease;
          position: relative;
        }
        .nav-link-item:hover {
          color: ${G.goldLight};
        }
        .nav-gold-cta {
          background: linear-gradient(135deg, ${G.gold} 0%, ${G.goldLight} 50%, ${G.gold} 100%);
          color: ${G.black};
          border: none;
          padding: 9px 24px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 1px;
        }
        .nav-gold-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(201, 168, 76, 0.35);
        }
        .mobile-hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 22px;
          color: ${G.textDark};
          cursor: pointer;
        }
        .mobile-drawer-item {
          color: ${G.textDark};
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          padding: 14px 12px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(201, 168, 76, 0.1);
          transition: all 0.2s ease;
        }
        .mobile-drawer-item:hover {
          color: ${G.goldLight};
          padding-left: 18px;
        }
        .drawer-num {
          color: ${G.gold};
          font-size: 10px;
          margin-right: 12px;
          font-weight: 600;
        }
        @media (max-width: 868px) {
          header { padding: 16px 24px !important; }
          .nav-links-desktop { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}
