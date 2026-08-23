import { G } from "../../styles/theme";

const EDITORIAL_CATEGORIES = [
  {
    name: "Pulseras",
    tagline: "Elegancia en la Muñeca",
    desc: "Tejidos clásicos Cuban Link, 3x1 y diseños exclusivos en oro laminado 18K.",
    img: "/PULSERAS/CUBAN LINK 3.1 MM 19 CM.png",
  },
  {
    name: "Cadenas",
    tagline: "Presencia e Impacto",
    desc: "Cubana Sol, Franco y Serpiente con acabado brillante impecable.",
    img: "/CADENAS/CUBANA SOL 65 CM.png",
  },
  {
    name: "Anillos",
    tagline: "Detalles Eternos",
    desc: "Anillos Alianza, Flicker y Duality creados para ocasiones memorables.",
    img: "/ANILLOS/ANILLO ALIANZA T5.5.png",
  },
  {
    name: "Aretes",
    tagline: "Destellos de Luz",
    desc: "Topos y candongas de oro laminado con zirconias seleccionadas a mano.",
    img: "/ARETES/SHINE 14 MM.png",
  },
  {
    name: "Brazaletes",
    tagline: "Carácter Único",
    desc: "Diseños de balín 8mm y neopreno para Hombre, Mujer y Parejas.",
    img: "/BRAZALETES HOMBRE/BALIN 8 MM.png",
  },
];

export function EditorialCollections({ onSelectCategory, onNavigate }) {
  const handleCategoryClick = (catName) => {
    onSelectCategory(catName);
    onNavigate("catalog");
  };

  return (
    <section
      id="editorial-collections"
      style={{
        background: "#0A0909",
        padding: "100px 0",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "56px",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <span className="section-label">COLECCIONES DE LUJO</span>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(32px, 4.5vw, 52px)",
                fontWeight: 300,
                color: G.textDark,
                marginTop: "8px",
                letterSpacing: "1px",
              }}
            >
              Líneas Exclusivas
            </h2>
          </div>

          <button
            className="gold-outline-btn"
            onClick={() => handleCategoryClick("Todos")}
          >
            Ver Catálogo Completo →
          </button>
        </div>

        {/* Editorial Mosaic Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
          }}
        >
          {EDITORIAL_CATEGORIES.map((cat, idx) => {
            // Span logic for editorial mosaic
            let colSpan = "span 4";
            if (idx === 0) colSpan = "span 7";
            else if (idx === 1) colSpan = "span 5";

            return (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                style={{
                  gridColumn: colSpan,
                  position: "relative",
                  height: "360px",
                  background: "#121110",
                  border: "1px solid rgba(201, 168, 76, 0.12)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "32px",
                }}
                className="editorial-card"
              >
                {/* Background Glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, rgba(201, 168, 76, 0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Product Image */}
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    bottom: "70px",
                    left: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                      filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.8))",
                      transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    className="editorial-img"
                  />
                </div>

                {/* Card Content Overlay */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    background: "linear-gradient(to top, rgba(10, 9, 9, 0.95) 0%, rgba(10, 9, 9, 0.6) 70%, transparent 100%)",
                    margin: "-32px",
                    padding: "32px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: G.goldLight,
                      fontWeight: 600,
                    }}
                  >
                    {cat.tagline}
                  </span>
                  <h3
                    className="serif"
                    style={{
                      fontSize: "28px",
                      fontWeight: 400,
                      color: G.textDark,
                      margin: "4px 0",
                    }}
                  >
                    {cat.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: G.textMuted,
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {cat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .editorial-card:hover {
          border-color: ${G.gold};
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(201, 168, 76, 0.15);
        }
        .editorial-card:hover .editorial-img {
          transform: scale(1.08) translateY(-6px);
        }
        @media (max-width: 992px) {
          .editorial-card {
            grid-column: span 6 !important;
          }
        }
        @media (max-width: 640px) {
          .editorial-card {
            grid-column: span 12 !important;
            height: 320px !important;
          }
        }
      `}</style>
    </section>
  );
}
