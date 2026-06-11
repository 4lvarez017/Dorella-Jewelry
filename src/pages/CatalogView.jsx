import { useState, useRef } from "react";
import { G } from "../styles/theme";
import { WHATSAPP_NUMBER, CATEGORIES } from "../data/constants";
import { useCart } from "../context/CartContext";
import { CatalogSection } from "../components/CatalogSection";
import { CartModal } from "../components/CartModal";
import { CheckoutModal } from "../components/CheckoutModal";
import { Footer } from "../components/Footer";

// ─── WhatsApp FAB ─────────────────────────────────────────────────────────────
export function WhatsAppFab() {
  return (
    <button
      className="whatsapp-fab"
      onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank")}
      aria-label="Chat por WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </button>
  );
}

// ─── Cart FAB ─────────────────────────────────────────────────────────────────
export function CartFab({ totalItems, onClick }) {
  return (
    <button className="cart-fab" onClick={onClick} aria-label="Ver carrito">
      🛒
      {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
    </button>
  );
}

// ─── Vista de Catálogo ────────────────────────────────────────────────────────
const GRID_CATEGORIES = [
  { name: "Anillos", icon: "💍", image: "/anillo_trebol.jpg" },
  { name: "Aretes", icon: "🌙", image: "/ARETES/AR%20AMORE%20HALO%209%20MM.png" },
  { name: "Brazaletes Hombre", icon: "🪙", image: "/BRAZALETES%20HOMBRE/BALIN%208%20MM.png" },
  { name: "Brazaletes Mujer", icon: "🪙", image: "/pulsera_3_carriles.jpg" },
  { name: "Brazaletes Niñas", icon: "🪙", image: "https://images.unsplash.com/photo-1630502870826-7d63d59abfe8?w=600&q=80" },
  { name: "Brazaletes Niños", icon: "🪙", image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&q=80" },
  { name: "Brazaletes Pareja", icon: "🪙", image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80" },
  { name: "Cadenas", icon: "🔗", image: "/CADENAS/C%20CUBANA%20CON%20DESTELLOS%2060%20CM.png" },
  { name: "Conjuntos", icon: "✨", image: "https://images.unsplash.com/photo-1573408301185-9519f94de0e4?w=600&q=80" },
  { name: "Cruceros", icon: "⚓", image: "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=600&q=80" },
  { name: "Dijes", icon: "🔮", image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80" },
  { name: "Herrajes", icon: "⚙️", image: "/HERRAJES/H%20CORAZON%20CIRCONIA.png" },
  { name: "Pulseras", icon: "💎", image: "/pulsera_ensamblada.jpg" },
  { name: "Rosarios", icon: "📿", image: "/ROSARIOS/ROSARIO%20BENEDICTUS%2043%20CM.png" },
  { name: "Tobilleras", icon: "🦶", image: "/TOBILLERA/T%20BLUE%20DREAM%2023%20CM.png" },
];


export function CatalogView({ setPage, activeCategory, setActiveCategory, onViewDetails }) {
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const catalogTopRef = useRef();

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    // Smooth scroll back to top of the catalog when category changes
    catalogTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: "#0A0909", minHeight: "100vh", position: "relative" }}>
      {/* Galaxy backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('/pulsera_base.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.06) blur(6px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Styles for grid category hover interactions */}
      <style>{`
        .category-card:hover {
          border-color: ${G.goldLight} !important;
          box-shadow: 0 12px 35px rgba(201, 168, 76, 0.25) !important;
        }
        .category-card:hover .card-bg-img {
          transform: scale(1.08);
          filter: brightness(0.55) contrast(1.1) !important;
        }
        .category-card:hover .card-emoji {
          transform: translateY(-4px) scale(1.1);
        }
        .category-card:hover .card-title {
          color: ${G.goldLight} !important;
        }
        .category-card:hover .card-cta-label {
          opacity: 1 !important;
          border-bottom-color: ${G.goldLight} !important;
          letter-spacing: 3px !important;
        }
        
        @media (max-width: 900px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 600px) {
          .categories-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .category-card {
            height: 200px !important;
          }
        }
      `}</style>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 900,
          background: "rgba(20, 19, 18, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${G.creamDark}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Volver */}
        <button
          onClick={() => {
            if (activeCategory === "Todos") {
              setPage("home");
            } else {
              handleCategorySelect("Todos");
            }
          }}
          style={{
            background: "rgba(18, 17, 16, 0.7)",
            border: "1px solid rgba(201, 168, 76, 0.25)",
            color: G.textMid,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            borderRadius: "1px",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = G.gold;
            e.currentTarget.style.color = G.textDark;
            e.currentTarget.style.background = "rgba(201, 168, 76, 0.12)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(201, 168, 76, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.25)";
            e.currentTarget.style.color = G.textMid;
            e.currentTarget.style.background = "rgba(18, 17, 16, 0.7)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span style={{ fontSize: "14px", color: G.gold }}>←</span>{" "}
          {activeCategory === "Todos" ? "Inicio" : "Categorías"}
        </button>

        {/* Logo / Categoría */}
        <div
          onClick={() => setPage("home")}
          style={{
            textAlign: "center",
            cursor: "pointer",
            transition: "opacity 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 0.85}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
        >
          <p
            className="serif"
            style={{
              fontSize: "20px",
              color: G.gold,
              fontWeight: 500,
              lineHeight: 1.1,
            }}
          >
            Dorella Jewelry
          </p>
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: G.textMuted,
              marginTop: "2px",
            }}
          >
            Catálogo
          </p>
        </div>

        {/* Acciones (Espaciador para centrar logo) */}
        <div style={{ width: "110px" }} />
      </header>

      {/* Contenedor de referencia para scroll */}
      <div ref={catalogTopRef} style={{ height: "1px" }} />

      <main className="main-content" style={{ minWidth: 0, position: "relative", zIndex: 2 }}>
        {activeCategory === "Todos" ? (
          <>
            {/* Encabezado del catálogo de categorías */}
            <div
              style={{
                background: "transparent",
                color: G.textDark,
                textAlign: "center",
                padding: "60px 20px 40px",
                position: "relative",
                overflow: "hidden",
                zIndex: 2
              }}
            >
              {/* Luz dorada de fondo */}
              <div
                style={{
                  position: "absolute",
                  top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: "400px", height: "400px",
                  background: `radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)`,
                  pointerEvents: "none",
                  zIndex: 1
                }}
              />
              <div style={{ position: "relative", zIndex: 2 }}>
                <span className="section-label">Colección Dorella</span>
                <div className="gold-separator" />
                <h2 className="serif" style={{ fontSize: "46px", fontWeight: 400, color: G.gold, letterSpacing: "1px" }}>
                  Explora por Categorías
                </h2>
                <p style={{ color: G.textMuted, fontSize: "13px", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "12px", fontWeight: 400 }}>
                  Oro 18K Laminado Exclusivo
                </p>
              </div>
            </div>

            {/* Grilla de Categorías */}
            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 24px 80px",
                position: "relative",
                zIndex: 2
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "24px",
                }}
                className="categories-grid"
              >
                {GRID_CATEGORIES.map((cat) => (
                  <div
                    key={cat.name}
                    onClick={() => handleCategorySelect(cat.name)}
                    className="category-card"
                    style={{
                      position: "relative",
                      height: "260px",
                      borderRadius: "1px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: `1px solid rgba(201, 168, 76, 0.15)`,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                      transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Imagen de fondo — lazy loading nativo */}
                    <img
                      src={cat.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      aria-hidden="true"
                      className="card-bg-img"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "brightness(0.35) contrast(1.1)",
                        transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    />


                    {/* Contenido centrado */}
                    <div
                      style={{
                        position: "relative",
                        zIndex: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        textAlign: "center",
                      }}
                    >
                      <span
                        className="card-emoji"
                        style={{
                          fontSize: "36px",
                          marginBottom: "12px",
                          display: "block",
                          transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}
                      >
                        {cat.icon}
                      </span>

                      <h3
                        className="serif card-title"
                        style={{
                          fontSize: "26px",
                          color: G.textDark,
                          fontWeight: 400,
                          letterSpacing: "1px",
                          marginBottom: "6px",
                          transition: "color 0.3s",
                        }}
                      >
                        {cat.name}
                      </h3>

                      <span
                        className="card-cta-label"
                        style={{
                          fontSize: "9px",
                          textTransform: "uppercase",
                          letterSpacing: "2px",
                          color: G.goldLight,
                          opacity: 0.8,
                          fontWeight: 500,
                          borderBottom: "1px solid transparent",
                          paddingBottom: "2px",
                          transition: "all 0.3s",
                        }}
                      >
                        Ver Colección
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Banner de Categoría Activa */}
            <div
              style={{
                background: "transparent",
                color: G.textDark,
                textAlign: "center",
                padding: "48px 20px 24px",
                borderBottom: `1px solid ${G.creamDark}`,
                position: "relative",
                zIndex: 2
              }}
            >
              <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: G.goldLight, fontWeight: 500 }}>
                Categoría Seleccionada
              </span>
              <h2 className="serif" style={{ fontSize: "38px", fontWeight: 400, marginTop: "6px", color: G.textDark, letterSpacing: "1px" }}>
                {activeCategory}
              </h2>
              <div className="gold-separator" style={{ marginTop: "12px", marginBottom: "0" }} />
            </div>

            {/* Breadcrumb / Retorno superior */}
            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "24px 24px 0",
                display: "flex",
                justifyContent: "flex-start"
              }}
            >
              <button
                onClick={() => handleCategorySelect("Todos")}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201, 168, 76, 0.3)",
                  color: G.goldLight,
                  padding: "10px 20px",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  cursor: "pointer",
                  borderRadius: "1px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201, 168, 76, 0.1)";
                  e.currentTarget.style.borderColor = G.gold;
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(201, 168, 76, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: "14px" }}>←</span> Ver Todas las Categorías
              </button>
            </div>

            <CatalogSection activeCategory={activeCategory} id="catalog" onViewDetails={onViewDetails} />
          </>
        )}

        <Footer />

        {/* Acceso Admin */}
        <div
          onClick={() => setPage("admin")}
          style={{
            textAlign: "center",
            padding: "8px",
            background: G.black,
            fontSize: "10px",
            color: "rgba(255,255,255,0.2)",
            cursor: "pointer",
            letterSpacing: "1px",
          }}
        >
          Admin
        </div>
      </main>

      {/* FABs flotantes */}
      <CartFab totalItems={totalItems} onClick={() => setCartOpen(true)} />
      <WhatsAppFab />

      {/* Modales */}
      {cartOpen && (
        <CartModal
          onClose={() => setCartOpen(false)}
          onCheckout={() => setCheckoutOpen(true)}
        />
      )}
      {checkoutOpen && (
        <CheckoutModal
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
