import { useState } from "react";
import { G } from "../../styles/theme";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductsContext";

const CURATED_IDS = [1, 201, 141, 609, 406, 600];

export function FeaturedCurated({ onViewDetails, onNavigate }) {
  const { dispatch } = useCart();
  const { products } = useProducts();
  const [addedId, setAddedId] = useState(null);

  // Filter curated selection from products context or fallbacks
  const featured = products
    .filter((p) => CURATED_IDS.includes(Number(p.id)) || p.visible)
    .slice(0, 6);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch({ type: "ADD_ITEM", payload: product });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <section
      style={{
        background: "#0E0D0C",
        padding: "100px 0",
        position: "relative",
        borderTop: "1px solid rgba(201, 168, 76, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span className="section-label">SELECCIÓN DE LA CASA</span>
          <div className="gold-separator" style={{ margin: "14px auto" }} />
          <h2
            className="serif"
            style={{
              fontSize: "clamp(32px, 4.5vw, 50px)",
              fontWeight: 300,
              color: G.textDark,
              letterSpacing: "1px",
            }}
          >
            Piezas Destacadas
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: G.textMid,
              maxWidth: "520px",
              margin: "12px auto 0",
              lineHeight: 1.7,
            }}
          >
            Nuestras creaciones más emblemáticas fabricadas con estándares de pureza 18K y acabado artesanal.
          </p>
        </div>

        {/* Featured Products Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "32px",
          }}
        >
          {featured.map((prod) => (
            <a
              key={prod.id}
              href={`?page=product&productId=${prod.id}`}
              onClick={(e) => {
                e.preventDefault();
                onViewDetails(prod);
              }}
              style={{
                background: "#121110",
                border: "1px solid rgba(201, 168, 76, 0.15)",
                borderRadius: "2px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                textDecoration: "none",
                color: "inherit",
              }}
              className="featured-luxury-card"
            >
              {/* Image Stage */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1",
                  background: "radial-gradient(circle at center, rgba(201, 168, 76, 0.06) 0%, transparent 75%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                }}
              >
                <img
                  src={prod.image || (prod.images && prod.images[0]) || "/placeholder.jpg"}
                  alt={prod.name}
                  style={{
                    maxWidth: "85%",
                    maxHeight: "85%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 12px 24px rgba(0, 0, 0, 0.9))",
                    transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className="card-img"
                />

                {/* Category Tag Badge */}
                <span
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    fontSize: "9px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    background: "rgba(10, 9, 9, 0.8)",
                    color: G.goldLight,
                    border: "1px solid rgba(201, 168, 76, 0.3)",
                    padding: "4px 10px",
                    borderRadius: "1px",
                  }}
                >
                  {prod.category}
                </span>
              </div>

              {/* Product Info */}
              <div
                style={{
                  padding: "20px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h3
                    className="serif"
                    style={{
                      fontSize: "18px",
                      fontWeight: 400,
                      color: G.textDark,
                      marginBottom: "8px",
                      lineHeight: 1.3,
                    }}
                  >
                    {prod.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: G.textMuted,
                      marginBottom: "16px",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {prod.desc || "Joyería fina en oro laminado de 18K inalterable con acabado pulido espejo y garantía de calidad."}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 500,
                      color: G.goldLight,
                      letterSpacing: "0.5px",
                    }}
                  >
                    ${Number(prod.price || 0).toLocaleString("es-CO")} COP
                  </span>

                  <button
                    onClick={(e) => handleAddToCart(e, prod)}
                    style={{
                      background: addedId === prod.id ? G.gold : "transparent",
                      color: addedId === prod.id ? G.black : G.goldLight,
                      border: `1px solid ${G.gold}`,
                      padding: "8px 16px",
                      borderRadius: "1px",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {addedId === prod.id ? "¡Añadido!" : "+ Agregar"}
                  </button>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All CTA */}
        <div style={{ textAlign: "center", marginTop: "56px" }}>
          <a
            href="?page=catalog"
            className="gold-btn"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("catalog");
            }}
            style={{
              display: "inline-block",
              textDecoration: "none",
              padding: "16px 48px",
              fontSize: "12px",
              letterSpacing: "3px",
            }}
          >
            Explorar Catálogo Completo
          </a>
        </div>
      </div>

      <style>{`
        .featured-luxury-card:hover {
          border-color: ${G.gold};
          transform: translateY(-5px);
          box-shadow: 0 16px 45px rgba(201, 168, 76, 0.15);
        }
        .featured-luxury-card:hover .card-img {
          transform: scale(1.07);
        }
        @media (max-width: 640px) {
          .featured-luxury-card {
            min-width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
