import { useState, useEffect, useRef } from "react";
import { G } from "../styles/theme";
import { WHATSAPP_NUMBER } from "../data/constants";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Anillo Alianza T5.5",
    category: "Anillos",
    price: 125000,
    image: "/ANILLOS/ANILLO ALIANZA T5.5.png",
    desc: "Anillo alianza clásico talla 5.5 en oro laminado 18k. Acabado brillante y elegante.",
  },
  {
    id: 201,
    name: "Balín 8 MM",
    category: "Brazaletes Hombre",
    price: 145000,
    image: "/BRAZALETES HOMBRE/BALIN 8 MM.png",
    desc: "Brazalete de balín 8mm en oro laminado 18k, clásico y robusto.",
  },
  {
    id: 141,
    name: "Shine 14 MM",
    category: "Aretes",
    price: 110000,
    image: "/ARETES/SHINE 14 MM.png",
    desc: "Aretes Shine 14mm en oro laminado 18k con máximo brillo y sofisticación.",
  },
  {
    id: 609,
    name: "Cuban Link 3.1 MM 19 CM",
    category: "Pulseras",
    price: 165000,
    image: "/PULSERAS/CUBAN LINK 3.1 MM 19 CM.png",
    desc: "Pulsera Cuban Link 3.1mm, 19cm en oro laminado 18k, estilo urbano y premium.",
  },
  {
    id: 406,
    name: "Cubana Sol 65 CM",
    category: "Cadenas",
    price: 265000,
    image: "/CADENAS/CUBANA SOL 65 CM.png",
    desc: "Cadena cubana sol, 65cm en oro laminado 18k, diseño sol radiante.",
  },
];

export function RouletteSection({ onViewDetails }) {
  const { dispatch } = useCart();
  const { products } = useProducts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);
  const autoplayRef = useRef(null);

  const showcaseProducts = FALLBACK_PRODUCTS.map((fallback) => {
    const real = products.find((p) => Number(p.id) === Number(fallback.id));
    return real || fallback;
  }).filter((p) => p.visible !== false);

  const N = showcaseProducts.length;
  const currentIndex = ((activeIndex % N) + N) % N;
  const activeProduct = showcaseProducts[currentIndex];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isHovered) {
      autoplayRef.current = setInterval(() => {
        setActiveIndex((prev) => prev + 1);
      }, 5000);
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovered]);

  const handleNext = () => {
    setActiveIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => prev - 1);
  };

  const handleSelect = (idx) => {
    const diff = idx - currentIndex;
    setActiveIndex((prev) => prev + diff);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch({ type: "ADD", item: activeProduct });
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  };

  const whatsappMessage = `Hola Dorella Jewelry, estoy interesado(a) en la pieza de Oro 18K: *${activeProduct.name}* (Precio: $${activeProduct.price.toLocaleString("es-CO")} COP). ¿Me podrían dar más detalles sobre la disponibilidad y el envío?`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const radius = isMobile ? 120 : 200;
  const centerSize = isMobile ? 150 : 240;
  const thumbSize = isMobile ? 60 : 85;

  return (
    <section
      id="roulette-showcase"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#0F0E0E",
        padding: isMobile ? "80px 20px" : "100px 40px",
        borderBottom: `1px solid ${G.creamDark}`,
      }}
    >
      {/* Blurred background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${activeProduct.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(70px) brightness(0.12)",
          transition: "background-image 1.2s ease-in-out",
          zIndex: 0,
        }}
      />

      {/* Gold spotlight overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${isMobile ? "50% 30%" : "75% 50%"}, rgba(201, 168, 76, 0.18) 0%, transparent 70%)`,
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1200px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1.1fr",
          gap: isMobile ? "40px" : "60px",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        {/* Left: Product Information */}
        <div
          style={{
            textAlign: isMobile ? "center" : "left",
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "center" : "flex-start",
          }}
        >
          <span
            className="section-label"
            style={{
              color: G.goldLight,
              letterSpacing: "4px",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            Escaparate Interactivo
          </span>
          <div
            className="gold-separator"
            style={{
              margin: isMobile ? "12px auto" : "12px 0 20px",
              width: "70px",
              background: `linear-gradient(90deg, ${G.gold}, transparent)`,
            }}
          />

          <h2
            className="serif"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 300,
              color: G.textDark,
              lineHeight: 1.2,
              marginBottom: "24px",
            }}
          >
            Ruleta de Diseños Exclusivos
          </h2>

          <div
            key={currentIndex}
            style={{
              animation: "textSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <h3
              className="serif"
              style={{
                fontSize: isMobile ? "22px" : "28px",
                fontWeight: 400,
                color: G.goldLight,
                marginBottom: isMobile ? "8px" : "12px",
              }}
            >
              {activeProduct.name}
            </h3>

            <p
              style={{
                fontSize: isMobile ? "13px" : "15px",
                color: G.textMid,
                lineHeight: isMobile ? 1.5 : 1.7,
                marginBottom: isMobile ? "16px" : "24px",
                minHeight: isMobile ? "auto" : "75px",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {activeProduct.desc}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "10px" : "14px",
                marginBottom: isMobile ? "20px" : "32px",
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: isMobile ? "24px" : "30px",
                  fontWeight: 600,
                  color: G.textDark,
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                ${activeProduct.price.toLocaleString("es-CO")}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: G.gold,
                  border: `1px solid rgba(201,168,76,0.4)`,
                  padding: "3px 8px",
                  borderRadius: "1px",
                  fontWeight: 500,
                  background: "rgba(201,168,76,0.06)",
                }}
              >
                Oro de 18 Quilates
              </span>
            </div>

            {/* CTA Buttons */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                justifyContent: isMobile ? "center" : "flex-start",
                width: "100%",
              }}
            >
              <button
                className="gold-btn"
                onClick={handleAddToCart}
                style={{
                  padding: "16px 36px",
                  fontSize: "12px",
                  minWidth: "190px",
                }}
              >
                {addedMessage ? "¡Agregado! ✓" : "Añadir al Carrito"}
              </button>

              <button
                className="gold-outline-btn"
                onClick={() => onViewDetails && onViewDetails(activeProduct)}
                style={{
                  padding: "16px 32px",
                  fontSize: "12px",
                  minWidth: "160px",
                  color: G.textDark,
                  borderColor: G.goldLight,
                }}
              >
                Ver Detalles
              </button>

              <button
                className="whatsapp-btn"
                onClick={() => window.open(whatsappUrl, "_blank")}
                style={{
                  padding: "12px 24px",
                  fontSize: "12px",
                  minWidth: "220px",
                  background: "rgba(37, 211, 102, 0.12)",
                  color: "#25D366",
                  border: "1px solid rgba(37, 211, 102, 0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "1px",
                  marginTop: "8px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.004 2c-5.51 0-9.99 4.49-9.99 10 0 2.003.593 3.87 1.614 5.437L2 22l4.71-1.537c1.503.957 3.284 1.537 5.29 1.537 5.51 0 10-4.49 10-10s-4.49-10-9.996-10zM8.336 8.165c.17-.384.348-.393.513-.399.135-.006.29-.006.444-.006.155 0 .408.058.621.284.213.226.813.794.994.981.18.188.303.406.18.627-.122.22-.18.355-.355.555-.175.2-.367.445-.523.597-.174.17-.355.355-.155.697.2.336.885 1.458 1.897 2.355.826.736 1.523.961 1.884 1.116.36.155.574.13.787-.116.213-.245.916-1.064 1.16-1.426.246-.36.49-.303.826-.18.335.122 2.129 1.003 2.496 1.187.368.187.613.277.703.432.09.155.09.897-.22 1.768-.31.871-1.806 1.4-2.484 1.419-.678.02-1.303-.2-5.748-1.955-3.69-1.458-6.07-5.213-6.25-5.452-.18-.239-1.45-1.929-1.45-3.677 0-1.748.916-2.606 1.246-2.948.33-.342.723-.426.897-.426z" />
                </svg>
                Asesoría WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Right: Enlarged Roulette Wheel */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: isMobile ? "340px" : "480px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Orbital path dotted ring */}
          <div
            className="roulette-dial"
            style={{
              position: "absolute",
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              borderRadius: "50%",
              border: "1.5px dashed rgba(201, 168, 76, 0.4)",
              animation: "spinSlow 60s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Golden bezel tick ring */}
          <div
            style={{
              position: "absolute",
              width: `${radius * 2 + 20}px`,
              height: `${radius * 2 + 20}px`,
              borderRadius: "50%",
              border: "1px solid rgba(201, 168, 76, 0.15)",
              pointerEvents: "none",
            }}
          />

          {/* Radial items */}
          {showcaseProducts.map((prod, i) => {
            const angle = i * 72 - activeIndex * 72 - 90;
            const isCurrent = i === currentIndex;

            return (
              <div
                key={prod.id}
                onClick={() => handleSelect(i)}
                className={`roulette-thumb ${isCurrent ? "active" : ""}`}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: `${thumbSize}px`,
                  height: `${thumbSize}px`,
                  borderRadius: "50%",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: isCurrent ? `3px solid ${G.goldLight}` : `1px solid rgba(201,168,76,0.35)`,
                  boxShadow: isCurrent
                    ? `0 0 25px ${G.gold}, inset 0 0 10px rgba(0,0,0,0.8)`
                    : "0 6px 15px rgba(0,0,0,0.5)",
                  background: G.black,
                  transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s",
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
                  zIndex: isCurrent ? 10 : 5,
                }}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s",
                  }}
                  className="thumb-img"
                />
              </div>
            );
          })}

          {/* Central Active Element */}
          <div
            style={{
              position: "relative",
              width: `${centerSize}px`,
              height: `${centerSize}px`,
              borderRadius: "50%",
              background: G.black,
              border: `3px solid ${G.gold}`,
              boxShadow: `0 0 50px rgba(201, 168, 76, 0.35), inset 0 0 30px rgba(0, 0, 0, 0.95)`,
              overflow: "hidden",
              zIndex: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)",
                zIndex: 1,
              }}
            />

            <img
              key={currentIndex}
              src={activeProduct.image}
              alt={activeProduct.name}
              style={{
                width: "90%",
                height: "90%",
                borderRadius: "50%",
                objectFit: "cover",
                zIndex: 2,
                animation: "fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            />

            <div
              key={`${currentIndex}_sweep`}
              className="shine-sweep"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4) 50%, transparent)",
                transform: "translateX(-100%) skewX(-30deg)",
                zIndex: 3,
                pointerEvents: "none",
                animation: "sweep 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards",
              }}
            />
          </div>

          {/* Navigation Controls */}
          <button
            onClick={handlePrev}
            className="roulette-btn"
            style={{
              position: "absolute",
              left: isMobile ? "-15px" : "-30px",
              background: "rgba(26, 25, 24, 0.9)",
              border: `1.5px solid ${G.gold}`,
              color: G.gold,
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 12,
              boxShadow: "0 6px 12px rgba(0,0,0,0.6)",
              fontSize: "18px",
              transition: "all 0.2s",
            }}
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            className="roulette-btn"
            style={{
              position: "absolute",
              right: isMobile ? "-15px" : "-30px",
              background: "rgba(26, 25, 24, 0.9)",
              border: `1.5px solid ${G.gold}`,
              color: G.gold,
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 12,
              boxShadow: "0 6px 12px rgba(0,0,0,0.6)",
              fontSize: "18px",
              transition: "all 0.2s",
            }}
          >
            ›
          </button>
        </div>
      </div>

      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-150%) skewX(-30deg); }
          100% { transform: translateX(150%) skewX(-30deg); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes textSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .roulette-thumb:hover {
          border-color: ${G.goldLight} !important;
          box-shadow: 0 0 20px ${G.gold} !important;
        }
        .roulette-thumb:hover .thumb-img {
          transform: scale(1.1);
        }
        .roulette-btn:hover {
          background: ${G.gold} !important;
          color: ${G.black} !important;
          box-shadow: 0 0 15px rgba(201, 168, 76, 0.5) !important;
          transform: scale(1.05);
        }
        .whatsapp-btn:hover {
          background: rgba(37, 211, 102, 0.2) !important;
          box-shadow: 0 0 15px rgba(37, 211, 102, 0.2) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  );
}
