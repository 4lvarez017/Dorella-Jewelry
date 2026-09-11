import { useState, useEffect, useRef } from "react";
import { G } from "../../styles/theme";

const STEPS = [
  {
    num: "01",
    title: "Pulsera Base",
    subtitle: "Estructura Madre",
    desc: "El tejido base de alta consistencia constituye los cimientos de la pieza, preparado para recibir los hilos y balines de oro.",
    img: "/pulsera_base.jpg",
  },
  {
    num: "02",
    title: "Diseño en 3 Carriles",
    subtitle: "Triple Hilera Paralela",
    desc: "La estructura se divide en tres hileras paralelas de balines. Esta configuración resalta el tramado artesanal y maximiza la reflexión lumínica.",
    img: "/pulsera_3_carriles.jpg",
  },
  {
    num: "03",
    title: "Diseño en 4 Carriles",
    subtitle: "Presencia Imponente",
    desc: "Para quienes buscan un volumen superior. El modelo de cuatro carriles otorga cuerpo y opulencia a la pieza.",
    img: "/pulsera_4_carriles.jpg",
  },
  {
    num: "04",
    title: "Ensamble de Precisión",
    subtitle: "Cierre Armónico",
    desc: "Las hileras confluyen hacia el cierre ajustable en oro. Esta unión asegura durabilidad y un ajuste perfecto al movimiento.",
    img: "/pulsera_ensamblada.jpg",
  },
  {
    num: "05",
    title: "Oro Laminado 18K",
    subtitle: "Fusión Molecular en 5 Capas",
    desc: "Nuestra aleación no se pela ni se altera ante el agua, sudor o perfumes gracias a su blindaje térmico de 5 niveles:",
    layers: [
      "1. Oro 18K Capa Externa — Brillo inalterable y protección anticorrosión.",
      "2. Oro 18K Capa Intermedia — Refuerzo de tonalidad y riqueza tonal.",
      "3. Barrera de Níquel — Bloquea migración de metales y aporta firmeza.",
      "4. Enlace de Cobre — Unión molecular sólida entre el núcleo y el oro.",
      "5. Núcleo de Bronce de Joyería — Núcleo maleable de alta densidad.",
    ],
    img: "/pulsera_materiales.jpg",
  },
];

export function CraftsmanshipStory() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);

  return (
    <section
      id="craftsmanship"
      ref={containerRef}
      style={{
        position: "relative",
        background: "#0E0D0C",
        padding: "100px 0",
        borderTop: "1px solid rgba(201, 168, 76, 0.1)",
        borderBottom: "1px solid rgba(201, 168, 76, 0.1)",
      }}
    >
      {/* Background Soft Glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "30%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(201, 168, 76, 0.06) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span className="section-label">INGENIERÍA Y ARTESANÍA</span>
          <div className="gold-separator" style={{ margin: "14px auto" }} />
          <h2
            className="serif"
            style={{
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 300,
              color: G.textDark,
              letterSpacing: "1px",
            }}
          >
            Fases de Construcción 18K
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: G.textMid,
              maxWidth: "540px",
              margin: "12px auto 0",
              lineHeight: 1.7,
            }}
          >
            Explora la evolución de nuestros brazaletes desde su tejido inicial hasta la arquitectura de fusión en 5 capas.
          </p>
        </div>

        {/* Interactive Step Switcher Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "56px",
            flexWrap: "wrap",
          }}
        >
          {STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.num}
                onClick={() => setActiveStep(idx)}
                style={{
                  background: isActive ? "rgba(201, 168, 76, 0.12)" : "rgba(255, 255, 255, 0.02)",
                  border: isActive ? `1px solid ${G.gold}` : "1px solid rgba(255, 255, 255, 0.08)",
                  color: isActive ? G.goldLight : G.textMuted,
                  padding: "10px 20px",
                  fontSize: "11px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  borderRadius: "2px",
                }}
              >
                {step.num}. {step.title}
              </button>
            );
          })}
        </div>

        {/* Active Stage Display Panel */}
        <div
          className="story-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "56px",
            alignItems: "center",
            background: "rgba(10, 9, 9, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(201, 168, 76, 0.18)",
            padding: "48px",
            borderRadius: "4px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Image Display */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1.2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              key={STEPS[activeStep].img}
              src={STEPS[activeStep].img}
              alt={STEPS[activeStep].title}
              width="500"
              height="416"
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "4px",
                filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.85))",
                animation: "storyFadeIn 0.5s ease forwards",
              }}
            />
          </div>

          {/* Text & Layers Content */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: G.goldLight,
                letterSpacing: "4px",
                marginBottom: "8px",
              }}
            >
              FASE {STEPS[activeStep].num} / 05
            </span>
            <h3
              className="serif"
              style={{
                fontSize: "36px",
                fontWeight: 300,
                color: G.textDark,
                letterSpacing: "1px",
                lineHeight: 1.2,
                marginBottom: "4px",
              }}
            >
              {STEPS[activeStep].title}
            </h3>
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: G.gold,
                marginBottom: "20px",
              }}
            >
              {STEPS[activeStep].subtitle}
            </p>

            <div
              style={{
                width: "50px",
                height: "1px",
                background: G.gold,
                marginBottom: "20px",
                opacity: 0.5,
              }}
            />

            <p
              style={{
                fontSize: "14px",
                color: G.textMid,
                lineHeight: 1.8,
                marginBottom: STEPS[activeStep].layers ? "16px" : "0",
              }}
            >
              {STEPS[activeStep].desc}
            </p>

            {STEPS[activeStep].layers && (
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  paddingLeft: "0",
                  listStyle: "none",
                  marginTop: "8px",
                }}
              >
                {STEPS[activeStep].layers.map((layer, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: "12px",
                      color: G.textDark,
                      padding: "8px 12px",
                      background: "rgba(201, 168, 76, 0.05)",
                      borderLeft: `2px solid ${G.gold}`,
                      lineHeight: 1.5,
                    }}
                  >
                    {layer}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes storyFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 868px) {
          .story-grid {
            grid-template-columns: 1fr !important;
            padding: 24px !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </section>
  );
}
