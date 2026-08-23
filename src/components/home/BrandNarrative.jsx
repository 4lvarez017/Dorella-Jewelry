import { G } from "../../styles/theme";
import { WHATSAPP_NUMBER } from "../../data/constants";

export function BrandNarrative() {
  return (
    <section
      id="brand-narrative"
      style={{
        background: "#0A0909",
        padding: "120px 0",
        position: "relative",
        borderTop: "1px solid rgba(201, 168, 76, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div
          className="brand-narrative-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            alignItems: "center",
          }}
        >
          {/* Text Content */}
          <div>
            <span className="section-label">NUESTRAS RAÍCES</span>
            <div className="gold-separator" style={{ margin: "14px 0" }} />
            <h2
              className="serif"
              style={{
                fontSize: "clamp(34px, 4.5vw, 54px)",
                fontWeight: 300,
                color: G.textDark,
                lineHeight: 1.15,
                marginBottom: "24px",
                letterSpacing: "1px",
              }}
            >
              Maestría Orfebre Colombiana
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: G.textMid,
                lineHeight: 1.85,
                marginBottom: "20px",
                fontWeight: 300,
              }}
            >
              Nacidos en los talleres artesanales de <strong>Ocaña</strong> y <strong>Montería</strong>, cada pieza de Dorella Jewelry es el resultado de la unión entre técnicas ancestrales y tecnología de blindaje 18K.
            </p>
            <p
              style={{
                fontSize: "14px",
                color: G.textMuted,
                lineHeight: 1.8,
                marginBottom: "32px",
              }}
            >
              Cada eslabón, balín y cierre pasa por un control estricto de 7 etapas para garantizar que el brillo del oro permanezca inalterable frente al tiempo, la perfumería y el agua.
            </p>

            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Dorella Jewelry, quisiera consultar sobre sus joyas en oro laminado 18K.")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button className="gold-btn" style={{ fontSize: "11px", padding: "14px 28px" }}>
                  Asesoría en WhatsApp
                </button>
              </a>
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: G.gold,
                  fontWeight: 600,
                }}
              >
                📍 Ocaña • Montería
              </span>
            </div>
          </div>

          {/* Visual Presentation */}
          <div
            style={{
              position: "relative",
              borderRadius: "2px",
              overflow: "hidden",
              border: "1px solid rgba(201, 168, 76, 0.2)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80"
              alt="Artesanía Dorella Jewelry"
              style={{
                width: "100%",
                aspectRatio: "4/3",
                objectFit: "cover",
                filter: "brightness(0.95)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "24px",
                background: "linear-gradient(to top, rgba(10, 9, 9, 0.95) 0%, transparent 100%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <span style={{ fontSize: "10px", letterSpacing: "3px", color: G.goldLight, textTransform: "uppercase" }}>
                  CERTIFICADO DE ORIGEN
                </span>
                <p className="serif" style={{ fontSize: "18px", color: G.textDark, margin: 0 }}>
                  Oro 18K Laminado Exclusivo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 868px) {
          .brand-narrative-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
