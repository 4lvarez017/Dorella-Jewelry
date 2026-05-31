import { G } from "../styles/theme";
import { useFadeIn } from "../hooks/useFadeIn";

const BRAND_SECTIONS = [
  {
    label: "Nuestra Historia",
    title: "Raíces de Oro",
    body: "Desde los talleres artesanales de Ocaña y Montería, cada pieza nace de manos expertas que fusionan técnicas ancestrales colombianas con diseño contemporáneo. Nuestros maestros joyeros llevan más de dos décadas perfeccionando el arte del orfebre.",
    img: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80",
    dark: false,
  },
  {
    label: "Calidad Garantizada",
    title: "Brillo Eterno",
    body: "Utilizamos exclusivamente oro laminado de 18 quilates de la más alta calidad y pureza. Cada pieza pasa por nuestro riguroso protocolo de control de 7 etapas para asegurar que su brillo, resistencia y acabados perduren por generaciones.",
    img: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=80",
    dark: true,
  },
  {
    label: "Momentos Únicos",
    title: "El Detalle Perfecto",
    body: "Un aniversario, una graduación, una declaración de amor — los momentos que cambian la vida merecen un símbolo a la altura. Ofrecemos servicio de personalización y grabado para convertir cada pieza en una joya única e irrepetible.",
    img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80",
    dark: false,
  },
];

function BrandItem({ section, index }) {
  const ref = useFadeIn();
  // Alternate between two very close soft dark tones to prevent abrupt transitions
  const bg = index % 2 === 0 ? "#121110" : "#181716";
  const titleColor = index % 2 === 0 ? G.textDark : G.pastelGold;

  return (
    <section
      style={{
        background: bg,
        padding: "100px 0",
        borderBottom: `1px solid rgba(201,168,76,0.05)`,
      }}
    >
      <div
        className="brand-grid"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px",
          alignItems: "center",
        }}
      >
        {/* Texto */}
        <div ref={ref} className="fade-in" style={{ order: index % 2 === 0 ? 0 : 1 }}>
          <span className="section-label">{section.label}</span>
          <div className="gold-separator" style={{ margin: "12px 0" }} />
          <h2
            className="serif"
            style={{
              fontSize: "44px",
              fontWeight: 400,
              color: titleColor,
              lineHeight: 1.2,
              marginBottom: "20px",
              letterSpacing: "0.5px"
            }}
          >
            {section.title}
          </h2>
          <p
            style={{
              color: G.textMid,
              lineHeight: 1.8,
              fontSize: "15px",
            }}
          >
            {section.body}
          </p>
        </div>

        {/* Imagen */}
        <div style={{ order: index % 2 === 0 ? 1 : 0, overflow: "hidden", borderRadius: "2px", border: `1px solid rgba(201,168,76,0.1)` }}>
          <img
            src={section.img}
            alt={section.title}
            style={{
              width: "100%",
              aspectRatio: "4/3",
              objectFit: "cover",
              transition: "transform 0.5s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      </div>
    </section>
  );
}

export function BrandSection({ id }) {
  return (
    <div id={id}>
      {BRAND_SECTIONS.map((s, i) => (
        <BrandItem key={i} section={s} index={i} />
      ))}
    </div>
  );
}
