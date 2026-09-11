import { G } from "../styles/theme";
import { WHATSAPP_NUMBER } from "../data/constants";

export function Footer() {
  return (
    <footer style={{ background: G.black, color: "rgba(255,255,255,0.6)", padding: "48px 40px 32px" }}>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "32px",
          marginBottom: "32px",
        }}
      >
        {/* Marca */}
        <div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "28px",
              color: G.gold,
              marginBottom: "8px",
            }}
          >
            Dorella Jewelry
          </p>
          <p style={{ fontSize: "12px", lineHeight: 1.7 }}>
            Artesanía colombiana de alta joyería. Desde Ocaña y Montería para el mundo.
          </p>
        </div>

        {/* Sedes */}
        <div>
          <p
            style={{
              color: G.gold,
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Nuestras Sedes
          </p>
          <div style={{ fontSize: "13px", lineHeight: 1.8 }}>
            <p style={{ margin: "4px 0" }}>
              📍 <strong>Ocaña</strong>, Norte de Santander{" "}
              <a
                href="https://maps.google.com/?q=Ocana+Norte+de+Santander+Colombia"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: G.gold, fontSize: "11px", textDecoration: "underline", marginLeft: "4px" }}
                title="Ver ubicación en Ocaña en Google Maps"
              >
                (Google Maps ↗)
              </a>
            </p>
            <p style={{ margin: "4px 0" }}>
              📍 <strong>Montería</strong>, Córdoba{" "}
              <a
                href="https://maps.google.com/?q=Monteria+Cordoba+Colombia"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: G.gold, fontSize: "11px", textDecoration: "underline", marginLeft: "4px" }}
                title="Ver ubicación en Montería en Google Maps"
              >
                (Google Maps ↗)
              </a>
            </p>
          </div>
        </div>

        {/* Contacto */}
        <div>
          <p
            style={{
              color: G.gold,
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Atención al Cliente (NAP)
          </p>
          <div style={{ fontSize: "13px", lineHeight: 1.8 }}>
            <p style={{ margin: "2px 0" }}>
              📱 Tel:{" "}
              <a
                href="tel:+573132403081"
                style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontWeight: 500 }}
                title="Llamar a Dorella Jewelry"
              >
                +57 313 240 3081
              </a>
            </p>
            <p style={{ margin: "2px 0" }}>
              💬 WhatsApp:{" "}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: G.gold, textDecoration: "underline" }}
                title="Escribir por WhatsApp a Dorella Jewelry"
              >
                Chat Directo (+57 313 240 3081)
              </a>
            </p>
            <p style={{ margin: "4px 0", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
              🕐 Horario: Lunes a Sábado: 8:00 AM – 7:00 PM
            </p>
            <p style={{ margin: "2px 0", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
              🇨🇴 Envíos asegurados a toda Colombia
            </p>
          </div>
        </div>

        {/* Redes sociales */}
        <div>
          <p
            style={{
              color: G.gold,
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Redes Sociales
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Instagram", "Facebook", "TikTok"].map((r) => (
              <div
                key={r}
                style={{
                  padding: "6px 12px",
                  border: `1px solid ${G.gold}40`,
                  fontSize: "11px",
                  color: G.gold,
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${G.gold}15`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Línea separadora */}
      <div
        style={{
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${G.gold}60, transparent)`,
          marginBottom: "20px",
        }}
      />

      <p style={{ textAlign: "center", fontSize: "12px" }}>
        © {new Date().getFullYear()} Dorella Jewelry — Hecho con ✨ en Colombia
      </p>
    </footer>
  );
}
