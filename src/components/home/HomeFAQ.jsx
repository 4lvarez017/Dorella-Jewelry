import { useState } from "react";
import { G } from "../../styles/theme";
import { WHATSAPP_NUMBER } from "../../data/constants";

const FAQS = [
  {
    q: "¿Qué es el oro laminado 18K y por qué es inalterable?",
    a: "El oro laminado 18K es una pieza con base metálica fundida térmicamente con capas de oro auténtico de 18 quilates de 3 a 5 micras. Es inalterable porque su unión molecular evita que el oro se desprenda, se pele o pierda brillo ante agua y sudor. A diferencia de un baño superficial, conserva la estética y durabilidad del oro sólido por años.",
    tag: "Materiales & Calidad",
  },
  {
    q: "¿Se pueden mojar las joyas de Dorella Jewelry en la piscina, mar o ducha?",
    a: "Sí, todas las joyas de oro laminado 18K de Dorella Jewelry son 100% resistentes al agua dulce, agua salada y sudor corporal. Su estructura en 5 capas previene la corrosión y no mancha la piel en duchas diarias, playa o piscinas. Para conservar su brillo espejo a largo plazo, basta enjuagarlas con agua limpia y secarlas con paño suave.",
    tag: "Resistencia al Agua",
  },
  {
    q: "¿Cómo comprar joyas con garantía y cuánto tarda el envío en Colombia?",
    a: "Dorella Jewelry ofrece garantía formal por escrito sobre la inalterabilidad del tono y brillo del oro 18K. Los envíos asegurados tardan de 24 a 48 horas hábiles en ciudades principales y de 3 a 5 días en el resto de Colombia. Puedes comprar con pasarela segura o mediante asesoría personalizada directa en WhatsApp (+57 313 240 3081).",
    tag: "Garantía & Envíos",
  },
  {
    q: "¿Las joyas producen alergias o manchas oscuras en la piel?",
    a: "No, las piezas de Dorella Jewelry son 100% hipoalergénicas y están totalmente libres de níquel. Al tener contacto directo únicamente con oro de 18 quilates, garantizan total seguridad para pieles sensibles sin irritación.",
    tag: "Hipoalergénico",
  },
];

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq-section"
      style={{
        padding: "96px 24px",
        background: G.carbon,
        color: G.textDark,
        position: "relative",
        borderTop: "1px solid rgba(201, 168, 76, 0.15)",
        borderBottom: "1px solid rgba(201, 168, 76, 0.15)",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        {/* Encabezado de Sección SEO */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: G.gold,
              fontWeight: 600,
            }}
          >
            RESOLUCIÓN DIRECTA &amp; ASESORÍA
          </span>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(28px, 4.5vw, 44px)",
              color: G.textDark,
              fontWeight: 400,
              marginTop: "12px",
              marginBottom: "16px",
              lineHeight: 1.2,
            }}
          >
            Preguntas Frecuentes sobre Oro Laminado 18K
          </h2>
          <p
            style={{
              color: G.textMid,
              fontSize: "15px",
              maxWidth: "620px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Respuestas claras y verificadas sobre la tecnología inalterable de nuestras joyas, procesos de fabricación y envíos en Colombia.
          </p>
        </div>

        {/* Lista de Acordeones FAQ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                style={{
                  background: isOpen ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isOpen ? G.gold : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "6px",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "16px",
                  }}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: G.goldLight,
                        fontWeight: 600,
                      }}
                    >
                      {faq.tag}
                    </span>
                    <h3
                      style={{
                        fontSize: "16px",
                        color: isOpen ? G.goldLight : G.textDark,
                        fontWeight: 500,
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {faq.q}
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: "20px",
                      color: G.gold,
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </button>

                <div
                  style={{
                    display: isOpen ? "block" : "none",
                    padding: "0 24px 24px 24px",
                    color: G.textMid,
                    fontSize: "14px",
                    lineHeight: 1.7,
                    borderTop: "1px solid rgba(201, 168, 76, 0.1)",
                    paddingTop: "16px",
                  }}
                >
                  <p style={{ margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Señal E-E-A-T: Autor, Taller & Fecha de Verificación */}
        <div
          style={{
            marginTop: "48px",
            padding: "20px 24px",
            borderRadius: "6px",
            background: "rgba(201, 168, 76, 0.05)",
            border: `1px dashed ${G.gold}40`,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            fontSize: "12px",
            color: G.textMuted,
          }}
        >
          <div>
            <strong style={{ color: G.gold }}>Dorella Jewelry Workshop</strong> • Información técnica auditada por maestros joyeros en Ocaña y Montería.
            <div style={{ marginTop: "4px" }}>
              Última actualización de especificaciones: <span style={{ color: G.textMid }}>Septiembre 2026</span> • Norma técnica de microcapas 18K.
            </div>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20hacer%20una%20consulta%20técnica%20sobre%20el%20oro%20laminado%2018K`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: G.gold,
              textDecoration: "underline",
              fontWeight: 500,
            }}
          >
            ¿Tienes otra pregunta? Hablar con un Asesor
          </a>
        </div>
      </div>
    </section>
  );
}
