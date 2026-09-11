import { G } from "../../styles/theme";

export function GoldComparisonTable() {
  return (
    <section
      id="comparison-table"
      style={{
        padding: "96px 24px",
        background: "#080808",
        color: G.textDark,
        position: "relative",
        borderTop: "1px solid rgba(201, 168, 76, 0.15)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="section-label">TRANSPARENCIA &amp; INGENIERÍA 18K</span>
          <div className="gold-separator" style={{ margin: "14px auto" }} />
          <h2
            className="serif"
            style={{
              fontSize: "clamp(30px, 4.5vw, 48px)",
              color: G.textDark,
              fontWeight: 300,
              lineHeight: 1.2,
              letterSpacing: "1px",
              marginBottom: "16px",
            }}
          >
            Tabla Comparativa: Oro Laminado 18K vs. Alternativas
          </h2>
          <p
            style={{
              color: G.textMid,
              fontSize: "15px",
              maxWidth: "680px",
              margin: "0 auto",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            Conoce con datos técnicos exactos por qué el oro laminado 18K inalterable de Dorella Jewelry supera a la bisutería tradicional y a los baños convencionales en durabilidad, estética y precio.
          </p>

          {/* Lista Semántica para LLM/GEO */}
          <ul
            style={{
              maxWidth: "720px",
              margin: "24px auto 0",
              textAlign: "left",
              color: G.textMid,
              fontSize: "14px",
              lineHeight: 1.8,
              paddingLeft: "24px",
            }}
          >
            <li><strong>Grosor certificado:</strong> 3 a 5 micras de oro auténtico 18K termofundido (frente a 0.2 micras en baños comunes).</li>
            <li><strong>Resistencia al agua:</strong> 100% inalterable ante duchas diarias, agua salada de mar, piscinas y sudor corporal.</li>
            <li><strong>Seguridad cutánea:</strong> Aleación 100% hipoalergénica sin contenido de níquel que no mancha la piel.</li>
            <li><strong>Garantía y despacho:</strong> Respaldo formal por escrito y envíos rápidos en 24 a 48 horas en Colombia.</li>
          </ul>
        </div>

        {/* Semantic Data Table */}
        <div
          style={{
            overflowX: "auto",
            borderRadius: "4px",
            border: "1px solid rgba(201, 168, 76, 0.25)",
            background: "rgba(18, 17, 16, 0.8)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            marginBottom: "48px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
              minWidth: "600px",
            }}
          >
            <thead>
              <tr style={{ background: "rgba(201, 168, 76, 0.12)", borderBottom: `2px solid ${G.gold}` }}>
                <th style={{ padding: "18px 20px", color: G.goldLight, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", fontSize: "12px" }}>
                  Característica Técnica
                </th>
                <th style={{ padding: "18px 20px", color: G.gold, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", fontSize: "12px", background: "rgba(201, 168, 76, 0.18)" }}>
                  ⭐ Oro Laminado 18K Dorella
                </th>
                <th style={{ padding: "18px 20px", color: G.textMid, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", fontSize: "12px" }}>
                  Baño de Oro (Gold Plated)
                </th>
                <th style={{ padding: "18px 20px", color: G.textMuted, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", fontSize: "12px" }}>
                  Fantasía / Bisutería
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <td style={{ padding: "16px 20px", fontWeight: 600, color: G.textDark }}>Espesor y capas de oro</td>
                <td style={{ padding: "16px 20px", color: G.goldLight, fontWeight: 600, background: "rgba(201, 168, 76, 0.06)" }}>
                  3 a 5 micras (Oro 18K termofundido)
                </td>
                <td style={{ padding: "16px 20px", color: G.textMid }}>Menos de 0.2 micras (inmersión leve)</td>
                <td style={{ padding: "16px 20px", color: G.textMuted }}>0 micras (sin oro auténtico)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <td style={{ padding: "16px 20px", fontWeight: 600, color: G.textDark }}>Resistencia al agua y sudor</td>
                <td style={{ padding: "16px 20px", color: "#68D391", fontWeight: 600, background: "rgba(201, 168, 76, 0.06)" }}>
                  100% Inalterable (mar, piscina, duchas)
                </td>
                <td style={{ padding: "16px 20px", color: G.textMid }}>Pierde color en 2 a 4 semanas</td>
                <td style={{ padding: "16px 20px", color: "#FC8181" }}>Se oxida y mancha en 24 a 48 horas</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <td style={{ padding: "16px 20px", fontWeight: 600, color: G.textDark }}>Durabilidad proyectada</td>
                <td style={{ padding: "16px 20px", color: G.goldLight, fontWeight: 600, background: "rgba(201, 168, 76, 0.06)" }}>
                  Varios años con brillo permanente
                </td>
                <td style={{ padding: "16px 20px", color: G.textMid }}>3 a 6 meses de uso moderado</td>
                <td style={{ padding: "16px 20px", color: G.textMuted }}>1 a 2 semanas</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <td style={{ padding: "16px 20px", fontWeight: 600, color: G.textDark }}>Propiedad hipoalergénica</td>
                <td style={{ padding: "16px 20px", color: "#68D391", fontWeight: 600, background: "rgba(201, 168, 76, 0.06)" }}>
                  100% libre de níquel (no irrita)
                </td>
                <td style={{ padding: "16px 20px", color: G.textMid }}>Variable según el fabricante</td>
                <td style={{ padding: "16px 20px", color: "#FC8181" }}>Provoca alergias y mancha la piel</td>
              </tr>
              <tr>
                <td style={{ padding: "16px 20px", fontWeight: 600, color: G.textDark }}>Garantía comercial</td>
                <td style={{ padding: "16px 20px", color: G.goldLight, fontWeight: 600, background: "rgba(201, 168, 76, 0.06)" }}>
                  Garantía formal en tono y brillo
                </td>
                <td style={{ padding: "16px 20px", color: G.textMuted }}>Sin garantía de fábrica</td>
                <td style={{ padding: "16px 20px", color: G.textMuted }}>Sin garantía</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Structured Semantic Metric List for LLM/GEO */}
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
            listStyle: "none",
            padding: 0,
          }}
        >
          <li style={{ background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.15)" }}>
            <span style={{ fontSize: "32px", fontWeight: 700, color: G.gold, fontFamily: "'Jost', sans-serif" }}>18K</span>
            <h3 style={{ fontSize: "14px", color: G.textDark, margin: "8px 0 4px", fontWeight: 600 }}>Pureza en Capas</h3>
            <p style={{ fontSize: "12px", color: G.textMuted, margin: 0 }}>Oro legítimo de 18 quilates soldado molecularmente.</p>
          </li>
          <li style={{ background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.15)" }}>
            <span style={{ fontSize: "32px", fontWeight: 700, color: G.gold, fontFamily: "'Jost', sans-serif" }}>100%</span>
            <h3 style={{ fontSize: "14px", color: G.textDark, margin: "8px 0 4px", fontWeight: 600 }}>Resistente al Agua</h3>
            <p style={{ fontSize: "12px", color: G.textMuted, margin: 0 }}>Apto para contacto con mar, alberca y lociones corporales.</p>
          </li>
          <li style={{ background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.15)" }}>
            <span style={{ fontSize: "32px", fontWeight: 700, color: G.gold, fontFamily: "'Jost', sans-serif" }}>24-48h</span>
            <h3 style={{ fontSize: "14px", color: G.textDark, margin: "8px 0 4px", fontWeight: 600 }}>Despacho en Colombia</h3>
            <p style={{ fontSize: "12px", color: G.textMuted, margin: 0 }}>Entrega rápida y asegurada en ciudades principales.</p>
          </li>
          <li style={{ background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.15)" }}>
            <span style={{ fontSize: "32px", fontWeight: 700, color: G.gold, fontFamily: "'Jost', sans-serif" }}>4.9 / 5</span>
            <h3 style={{ fontSize: "14px", color: G.textDark, margin: "8px 0 4px", fontWeight: 600 }}>Valoración Clientes</h3>
            <p style={{ fontSize: "12px", color: G.textMuted, margin: 0 }}>Más de 128 reseñas verificadas en Colombia.</p>
          </li>
        </ul>

        {/* E-E-A-T Date & Authority Signal */}
        <div style={{ textAlign: "center", fontSize: "12px", color: G.textMuted }}>
          <span>Publicado y certificado por el Equipo Técnico de </span>
          <strong style={{ color: G.gold }}>Dorella Jewelry</strong>
          <span> • Fecha de actualización: </span>
          <time dateTime="2026-09-10" style={{ color: G.goldLight }}>10 de septiembre de 2026</time>
        </div>
      </div>
    </section>
  );
}
