import { useState } from "react";
import { G } from "../../styles/theme";
import { WHATSAPP_NUMBER } from "../../data/constants";

const FAQS = [
  {
    q: "¿Qué es el oro laminado 18K y qué diferencia tiene con la fantasía o el baño de oro?",
    a: "El oro laminado 18K es una lámina gruesa de oro auténtico de 18 quilates soldada por termofusión sobre una base metálica de alta densidad. A diferencia de los baños de oro convencionales o la bisutería tradicional, no se decolora ni se desprende con el uso, garantizando un acabado inalterable frente al agua y el sudor. Esto permite disfrutar de la estética, peso y durabilidad del oro sólido a una fracción de su costo.",
    tag: "Materiales & Calidad",
  },
  {
    q: "¿Se pueden mojar las joyas de Dorella Jewelry en la piscina, mar o ducha?",
    a: "Sí, todas las piezas de oro laminado 18K de Dorella Jewelry son resistentes al agua dulce, agua salada y duchas diarias. Su proceso de fabricación molecular previene la corrosión y la oxidación provocada por la humedad o el pH de la piel. Para preservar su brillo espejo a largo plazo, se recomienda enjuagarlas con agua limpia y secarlas con un paño suave tras la exposición a químicos fuertes o cloro concentrado.",
    tag: "Uso Diario & Resistencia",
  },
  {
    q: "¿Cómo comprar y cuánto tarda en llegar un pedido en Colombia?",
    a: "Puedes comprar seleccionando tus piezas en el catálogo web y completando el pedido mediante WhatsApp o pasarela digital segura. Los envíos se despachan con cobertura a nivel nacional, con tiempos de entrega de 1 a 2 días hábiles en ciudades principales y de 3 a 5 días en el resto de Colombia. Todos los paquetes viajan debidamente asegurados y cuentan con código de rastreo en tiempo real.",
    tag: "Envíos & Pagos",
  },
  {
    q: "¿Las joyas de Dorella Jewelry cuentan con garantía?",
    a: "Sí, todas nuestras piezas cuentan con garantía formal sobre el tono, brillo y durabilidad del oro laminado de 18 quilates. Respaldamos la inalterabilidad de cada joya bajo condiciones normales de uso diario. Cada envío se somete a un riguroso control de calidad artesanal antes de su despacho.",
    tag: "Garantía Oficial",
  },
  {
    q: "¿Las piezas producen alergias o manchas oscuras en la piel?",
    a: "No, las joyas de Dorella Jewelry son 100% hipoalergénicas y están libres de níquel o componentes reactivos. Al estar recubiertas enteramente por oro auténtico de 18 quilates, son completamente seguras para personas con piel sensible o tendencia a irritaciones cutáneas.",
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

                {isOpen && (
                  <div
                    style={{
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
                )}
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
