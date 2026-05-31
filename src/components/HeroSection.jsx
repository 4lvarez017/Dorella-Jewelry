import { useState, useEffect, useRef } from "react";
import { G } from "../styles/theme";

// Gold Particle Class for Canvas 2D floating dust
class GoldParticle {
  constructor(width, height) {
    this.reset(width, height);
    this.y = Math.random() * height; // Initial random vertical distribution
  }

  reset(width, height) {
    this.x = Math.random() * width;
    this.y = height + 10;
    this.radius = 0.5 + Math.random() * 1.5;
    this.speedY = -(0.2 + Math.random() * 0.5);
    this.speedX = (Math.random() - 0.5) * 0.2;
    this.opacity = 0.15 + Math.random() * 0.4;
    this.maxOpacity = this.opacity;
    this.oscillationSpeed = 0.005 + Math.random() * 0.012;
    this.time = Math.random() * 100;
  }

  update(width, height, mouseX, mouseY) {
    this.y += this.speedY;
    this.time += this.oscillationSpeed;
    this.x += this.speedX + Math.sin(this.time) * 0.1;

    // Gentle push away from cursor
    if (mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        const force = (90 - dist) / 90;
        this.x += (dx / dist) * force * 1.2;
        this.y += (dy / dist) * force * 1.2;
      }
    }

    if (this.y < 60) {
      this.opacity -= 0.005;
    }

    if (this.y < -10 || this.opacity <= 0 || this.x < -10 || this.x > width + 10) {
      this.reset(width, height);
    }
  }
}

export function HeroSection({ onExplore }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Refs to DOM elements for lag-free direct styling bypass
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const layer3Ref = useRef(null);
  const layer4Ref = useRef(null);
  const layer5Ref = useRef(null);

  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  const card4Ref = useRef(null);
  const card5Ref = useRef(null);

  const mainTextRef = useRef(null);
  const techTitleRef = useRef(null);
  const exploreBtnRef = useRef(null);

  // Easing (lerp) states kept in mutable refs for rendering inside Raf loop
  const scrollProgressRef = useRef(0); // target progress from Y scroll
  const smoothProgressRef = useRef(0); // eased progress for visual layers
  const floatOffsetRef = useRef(0);
  const timeRef = useRef(0);

  const [mouse, setMouse] = useState({ x: null, y: null });
  const [isMobile, setIsMobile] = useState(false);

  // Monitor screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update target scroll progress on scroll (lightweight, zero React state re-renders)
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.clientHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const scrolled = -rect.top;
      scrollProgressRef.current = Math.max(0, Math.min(1, scrolled / totalHeight));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Butter-smooth render loop (constantly runs, lerping progress for ultimate fluidity)
  useEffect(() => {
    let animId;

    const renderLoop = () => {
      const diff = scrollProgressRef.current - smoothProgressRef.current;
      smoothProgressRef.current += diff * 0.075;

      timeRef.current += 0.015;
      floatOffsetRef.current = Math.sin(timeRef.current) * 6;

      updateVisuals(smoothProgressRef.current);

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isMobile]);

  const updateVisuals = (progress) => {
    // 1. Calculate Opacities for 5 layers
    let op1 = 0;
    let op2 = 0;
    let op3 = 0;
    let op4 = 0;
    let op5 = 0;

    // Progress Ranges:
    // Step 1: Base (0.0 to 0.15)
    // Trans 1->2: (0.15 to 0.25)
    // Step 2: 3 Carriles (0.25 to 0.38)
    // Trans 2->3: (0.38 to 0.48)
    // Step 3: 4 Carriles (0.48 to 0.60)
    // Trans 3->4: (0.60 to 0.70)
    // Step 4: Ensamblada (0.70 to 0.82)
    // Trans 4->5: (0.82 to 0.90)
    // Step 5: Materiales (0.90 to 1.0)

    if (progress <= 0.15) {
      op1 = 1;
    } else if (progress <= 0.25) {
      const t = (progress - 0.15) / 0.10;
      op1 = 1 - t;
      op2 = t;
    } else if (progress <= 0.38) {
      op2 = 1;
    } else if (progress <= 0.48) {
      const t = (progress - 0.38) / 0.10;
      op2 = 1 - t;
      op3 = t;
    } else if (progress <= 0.60) {
      op3 = 1;
    } else if (progress <= 0.70) {
      const t = (progress - 0.60) / 0.10;
      op3 = 1 - t;
      op4 = t;
    } else if (progress <= 0.82) {
      op4 = 1;
    } else if (progress <= 0.90) {
      const t = (progress - 0.82) / 0.08;
      op4 = 1 - t;
      op5 = t;
    } else {
      op5 = 1;
    }

    // Apply opacities and subtle float translation
    if (layer1Ref.current) {
      layer1Ref.current.style.opacity = op1;
      layer1Ref.current.style.transform = `scale(1) translateY(${floatOffsetRef.current * op1}px)`;
    }
    if (layer2Ref.current) {
      layer2Ref.current.style.opacity = op2;
      layer2Ref.current.style.transform = `scale(1) translateY(${floatOffsetRef.current * op2}px)`;
    }
    if (layer3Ref.current) {
      layer3Ref.current.style.opacity = op3;
      layer3Ref.current.style.transform = `scale(1) translateY(${floatOffsetRef.current * op3}px)`;
    }
    if (layer4Ref.current) {
      layer4Ref.current.style.opacity = op4;
      layer4Ref.current.style.transform = `scale(1) translateY(${floatOffsetRef.current * op4}px)`;
    }
    if (layer5Ref.current) {
      layer5Ref.current.style.opacity = op5;
      layer5Ref.current.style.transform = `scale(1) translateY(${floatOffsetRef.current * op5}px)`;
    }

    // 3. Fading main header text (completely gone by 0.20)
    const mainTextOpacity = Math.max(0, 1 - progress * 5);
    if (mainTextRef.current) {
      mainTextRef.current.style.opacity = mainTextOpacity;
      mainTextRef.current.style.transform = `translateY(${-progress * 40}px)`;
      mainTextRef.current.style.pointerEvents = mainTextOpacity < 0.1 ? "none" : "auto";
    }

    if (exploreBtnRef.current) {
      exploreBtnRef.current.style.opacity = mainTextOpacity;
      exploreBtnRef.current.style.transform = `translateX(-50%) translateY(${progress * 40}px)`;
      exploreBtnRef.current.style.pointerEvents = mainTextOpacity < 0.1 ? "none" : "auto";
    }

    // 4. Fading technical title header for step 5 (materials)
    const techTitleOpacity = progress >= 0.88 ? Math.min(1, (progress - 0.88) / 0.08) : 0;
    if (techTitleRef.current) {
      techTitleRef.current.style.opacity = techTitleOpacity;
      techTitleRef.current.style.pointerEvents = techTitleOpacity < 0.1 ? "none" : "auto";
    }

    // 5. Update left timeline steps classes
    let activeStage = 1;
    if (progress <= 0.20) activeStage = 1;
    else if (progress <= 0.43) activeStage = 2;
    else if (progress <= 0.65) activeStage = 3;
    else if (progress <= 0.86) activeStage = 4;
    else activeStage = 5;

    const dots = document.querySelectorAll(".timeline-dot");
    const labels = document.querySelectorAll(".timeline-label");
    dots.forEach((dot, idx) => {
      if (idx === activeStage - 1) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
    labels.forEach((label, idx) => {
      if (idx === activeStage - 1) {
        label.classList.add("active");
      } else {
        label.classList.remove("active");
      }
    });

    // 6. Update step detail cards opacities and slide in/out
    const updateCard = (ref, op) => {
      if (ref.current) {
        ref.current.style.opacity = op;
        ref.current.style.transform = `translateY(${(1 - op) * 15}px)`;
        ref.current.style.pointerEvents = op < 0.1 ? "none" : "auto";
      }
    };

    updateCard(card2Ref, op2);
    updateCard(card3Ref, op3);
    updateCard(card4Ref, op4);
    updateCard(card5Ref, op5);
  };

  // Canvas particle loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = isMobile ? 30 : 60;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new GoldParticle(canvas.width, canvas.height));
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update(canvas.width, canvas.height, mouse.x, mouse.y);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 201, 107, ${p.opacity})`;

        ctx.shadowBlur = p.radius * 2.5;
        ctx.shadowColor = "#C9A84C";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouse, isMobile]);

  const handleMouseMove = (e) => {
    setMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setMouse({ x: null, y: null });
  };

  const scrollToNextSection = () => {
    const el = document.getElementById("roulette-showcase");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="scroll-container"
      style={{
        position: "relative",
        height: "600vh", // Extended scroll track for 5-step animation
        background: "#0A0909",
      }}
    >
      {/* Sticky viewing panel */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Particle Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        {/* Static Gold Veins Dark Backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/pulsera_base.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.08) blur(8px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* HQ Image Sequence layers (Using centered 4K assets) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          {/* Layer 1: Pulsera Base */}
          <img
            ref={layer1Ref}
            src="/pulsera_base.jpg"
            alt="Pulsera Base"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 1,
              transform: "scale(1.0)",
              willChange: "opacity, transform",
            }}
          />

          {/* Layer 2: 3 Carriles */}
          <img
            ref={layer2Ref}
            src="/pulsera_3_carriles.jpg"
            alt="Diseño en 3 Carriles"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 0,
              transform: "scale(1.0)",
              willChange: "opacity, transform",
            }}
          />

          {/* Layer 3: 4 Carriles */}
          <img
            ref={layer3Ref}
            src="/pulsera_4_carriles.jpg"
            alt="Diseño en 4 Carriles"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 0,
              transform: "scale(1.0)",
              willChange: "opacity, transform",
            }}
          />

          {/* Layer 4: Pulsera Ensamblada */}
          <img
            ref={layer4Ref}
            src="/pulsera_ensamblada.jpg"
            alt="Pulsera Ensamblada"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 0,
              transform: "scale(1.0)",
              willChange: "opacity, transform",
            }}
          />

          {/* Layer 5: Desglose de Materiales */}
          <img
            ref={layer5Ref}
            src="/pulsera_materiales.jpg"
            alt="Materiales de Oro Laminado 18K"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 0,
              transform: "scale(1.0)",
              willChange: "opacity, transform",
            }}
          />
        </div>

        {/* Soft Vignette overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle, transparent 40%, rgba(10, 9, 9, 0.75) 85%, #0A0909 100%)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />

        {/* --- HTML CONTENT OVERLAYS --- */}

        {/* Scene 1: Initial Titles */}
        <div
          ref={mainTextRef}
          className="hero-text-overlay"
          style={{
            position: "relative",
            zIndex: 5,
            textAlign: "center",
            maxWidth: "750px",
            padding: "0 24px",
            willChange: "opacity, transform",
          }}
        >
          <span
            className="section-label"
            style={{
              color: G.goldLight,
              letterSpacing: "6px",
              fontSize: "12px",
              fontWeight: 600,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            DORELLA JEWELRY • EXPERIENCIA INMERSIVA
          </span>
          <div
            className="gold-separator"
            style={{
              margin: "16px auto 24px",
              width: "100px",
              height: "1.5px",
              background: `linear-gradient(90deg, transparent, ${G.goldLight}, transparent)`,
            }}
          />

          <h1
            className="serif"
            style={{
              fontSize: "clamp(36px, 7vw, 72px)",
              fontWeight: 300,
              color: G.textDark,
              lineHeight: 1.1,
              letterSpacing: "2px",
              textShadow: "0 4px 15px rgba(0,0,0,0.8)",
              marginBottom: "16px",
            }}
          >
            Pulsera de Oro 18K
          </h1>

          <p
            style={{
              fontSize: "clamp(13px, 1.8vw, 15px)",
              color: G.textMid,
              lineHeight: 1.8,
              maxWidth: "580px",
              margin: "0 auto 30px",
              textShadow: "0 2px 8px rgba(0,0,0,0.7)",
            }}
          >
            Ingeniería artesanal y pureza inalterable. Desliza hacia abajo para descubrir las fases de construcción y la tecnología molecular de nuestra pulsera premium.
          </p>
        </div>

        {/* Premium Button: Ver Catalogo (placed below the bracelet and fades on scroll) */}
        <div
          ref={exploreBtnRef}
          style={{
            position: "absolute",
            bottom: isMobile ? "90px" : "130px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 6,
            display: "flex",
            justifyContent: "center",
            width: "auto",
            willChange: "opacity, transform",
          }}
        >
          <button
            onClick={onExplore}
            style={{
              background: "rgba(10, 9, 9, 0.6)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1.5px solid rgba(201, 168, 76, 0.4)",
              color: G.textMid,
              padding: "16px 48px",
              fontSize: "14px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderRadius: "2px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201, 168, 76, 0.12)";
              e.currentTarget.style.borderColor = G.gold;
              e.currentTarget.style.color = G.textDark;
              e.currentTarget.style.boxShadow = "0 0 20px rgba(201, 168, 76, 0.35)";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(10, 9, 9, 0.6)";
              e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.4)";
              e.currentTarget.style.color = G.textMid;
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.6)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Ver Catalogo  {"-->"}
          </button>
        </div>

        {/* Scene 3: Exploded View Title Header */}
        <div
          ref={techTitleRef}
          style={{
            position: "absolute",
            top: isMobile ? "90px" : "110px",
            left: "40px",
            right: "40px",
            display: "flex",
            justifyContent: isMobile ? "center" : "space-between",
            alignItems: "center",
            opacity: 0,
            pointerEvents: "none",
            willChange: "opacity",
            zIndex: 6,
          }}
        >
          <div style={{ textAlign: isMobile ? "center" : "left" }}>
            <span
              style={{
                fontSize: "10px",
                color: G.goldLight,
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Desglose técnico de materiales
            </span>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 300,
                color: G.textDark,
                marginTop: "4px",
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              }}
            >
              Oro Laminado de Fusión Molecular
            </h2>
          </div>
          {!isMobile && (
            <div
              style={{
                fontSize: "11px",
                color: G.textMuted,
                letterSpacing: "1px",
                border: "1px solid rgba(201,168,76,0.3)",
                padding: "8px 16px",
                background: "rgba(10,9,9,0.7)",
                backdropFilter: "blur(5px)",
              }}
            >
              COMPOSICIÓN CERTIFICADA
            </div>
          )}
        </div>

        {/* Right Side: Step Details Panel (Glassmorphic) */}
        <div
          style={{
            position: "absolute",
            right: isMobile ? "20px" : "6%",
            bottom: isMobile ? "75px" : "auto",
            top: isMobile ? "auto" : "50%",
            transform: isMobile ? "none" : "translateY(-50%)",
            width: isMobile ? "calc(100% - 40px)" : "420px",
            height: isMobile ? "115px" : "320px", // Reduced height on mobile to prevent blocking the jewelry
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            zIndex: 8,
            pointerEvents: "none",
          }}
        >
          {/* Card 2: 3 Carriles */}
          <div
            ref={card2Ref}
            className="step-detail-card"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              willChange: "opacity, transform",
            }}
          >
            <span className="step-number">02 / 05</span>
            <h3>DISEÑO EN 3 CARRILES</h3>
            <div className="step-divider" />
            <p>
              La estructura se divide con precisión en tres hileras paralelas de balines. Esta configuración resalta el tramado artesanal y maximiza el brillo reflejado en la muñeca.
            </p>
          </div>

          {/* Card 3: 4 Carriles */}
          <div
            ref={card3Ref}
            className="step-detail-card"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              willChange: "opacity, transform",
            }}
          >
            <span className="step-number">03 / 05</span>
            <h3>DISEÑO EN 4 CARRILES</h3>
            <div className="step-divider" />
            <p>
              Para quienes buscan una presencia imponente. El modelo de cuatro carriles ofrece un volumen superior, destacando la opulencia y el acabado premium de los balines de oro.
            </p>
          </div>

          {/* Card 4: Ensamble de Precisión */}
          <div
            ref={card4Ref}
            className="step-detail-card"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              willChange: "opacity, transform",
            }}
          >
            <span className="step-number">04 / 05</span>
            <h3>ENSAMBLE DE PRECISIÓN</h3>
            <div className="step-divider" />
            <p>
              Las hileras confluyen nuevamente de forma armoniosa hacia el cierre ajustable. Esta unión asegura que la pulsera mantenga su estructura perfecta adaptándose con suavidad al movimiento.
            </p>
          </div>

          {/* Card 5: Capas y Materiales */}
          <div
            ref={card5Ref}
            className="step-detail-card"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              willChange: "opacity, transform",
            }}
          >
            <span className="step-number">05 / 05</span>
            <h3>TECNOLOGÍA DE ORO LAMINADO 18K</h3>
            <div className="step-divider" />
            <p style={{ marginBottom: isMobile ? "0px" : "8px" }}>
              Desglose de fusión en 5 capas que proporciona resistencia a la perfumería, sudoración y desgaste:
            </p>
            {!isMobile ? (
              <ul style={{ paddingLeft: "16px", fontSize: "11px", color: G.textMid, display: "flex", flexDirection: "column", gap: "2px" }}>
                <li><strong>1. Oro 18K Capa Externa:</strong> Brillo y protección anticorrosión.</li>
                <li><strong>2. Oro 18K Capa Intermedia:</strong> Refuerzo de color y acabado.</li>
                <li><strong>3. Níquel Barrera:</strong> Evita migración de metales y da firmeza.</li>
                <li><strong>4. Cobre de Adherencia:</strong> Unión estructural entre metales.</li>
                <li><strong>5. Bronce Joyería Base:</strong> Núcleo resistente de alta consistencia.</li>
              </ul>
            ) : (
              <p style={{ fontSize: "10px", lineHeight: "1.4", color: G.textMid, marginTop: "4px" }}>
                <strong>Capas:</strong> 1. Oro 18K (Ext.) • 2. Oro 18K (Int.) • 3. Barrera de Níquel • 4. Enlace de Cobre • 5. Núcleo de Bronce.
              </p>
            )}
          </div>
        </div>

        {/* Left Side: Timeline indicators */}
        {!isMobile && (
          <div
            className="scroll-timeline"
            style={{
              position: "absolute",
              left: "40px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
              zIndex: 7,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "7px",
                top: "10px",
                bottom: "10px",
                width: "1px",
                background: "rgba(255,255,255,0.08)",
                zIndex: 0,
              }}
            />
            {/* Step 1 */}
            <div className="timeline-step">
              <div className="timeline-dot active" />
              <span className="timeline-label active">1. Pulsera Base</span>
            </div>
            {/* Step 2 */}
            <div className="timeline-step">
              <div className="timeline-dot" />
              <span className="timeline-label">2. 3 Carriles</span>
            </div>
            {/* Step 3 */}
            <div className="timeline-step">
              <div className="timeline-dot" />
              <span className="timeline-label">3. 4 Carriles</span>
            </div>
            {/* Step 4 */}
            <div className="timeline-step">
              <div className="timeline-dot" />
              <span className="timeline-label">4. Ensamble</span>
            </div>
            {/* Step 5 */}
            <div className="timeline-step">
              <div className="timeline-dot" />
              <span className="timeline-label">5. Materiales</span>
            </div>
          </div>
        )}

        {/* Floating scroll action indicators */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            zIndex: 6,
            cursor: "pointer",
          }}
          onClick={scrollToNextSection}
        >
          <div className="scroll-indicator-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: G.goldLight,
                fontWeight: 600,
                textShadow: "0 2px 5px rgba(0,0,0,0.5)",
              }}
            >
              Desliza para el paso a paso
            </span>
            <div
              className="scroll-icon-mouse"
              style={{
                width: "18px",
                height: "30px",
                border: `1.5px solid ${G.gold}`,
                borderRadius: "10px",
                position: "relative",
                marginTop: "8px",
              }}
            >
              <div
                className="scroll-icon-wheel"
                style={{
                  width: "3px",
                  height: "6px",
                  background: G.goldLight,
                  borderRadius: "50%",
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: "6px",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollWheelAnim {
          0% { top: 6px; opacity: 1; }
          100% { top: 16px; opacity: 0; }
        }
        
        .scroll-icon-wheel {
          animation: scrollWheelAnim 1.8s ease-in-out infinite;
        }
        
        .timeline-step {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }
        .timeline-dot {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #0A0909;
          border: 1.5px solid rgba(255,255,255,0.18);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .timeline-dot.active {
          background: ${G.goldLight};
          border-color: ${G.gold};
          box-shadow: 0 0 12px ${G.gold};
          transform: scale(1.15);
        }
        .timeline-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: ${G.textMuted};
          opacity: 0.45;
          font-weight: 500;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }
        .timeline-label.active {
          color: ${G.textDark};
          opacity: 1;
          letter-spacing: 2px;
        }

        /* Glassmorphic technical step detail cards */
        .step-detail-card {
          background: rgba(10, 9, 9, 0.88);
          border: 1px solid rgba(201, 168, 76, 0.22);
          border-left: 4px solid ${G.gold};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 24px 32px;
          border-radius: 4px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        .step-detail-card:hover {
          border-color: ${G.goldLight};
          box-shadow: 0 20px 55px rgba(201, 168, 76, 0.12);
        }
        .step-number {
          font-size: 11px;
          font-weight: 600;
          color: ${G.goldLight};
          letter-spacing: 3px;
          margin-bottom: 6px;
        }
        .step-detail-card h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 300;
          color: ${G.textDark};
          letter-spacing: 2px;
        }
        .step-divider {
          width: 60px;
          height: 1.5px;
          background: linear-gradient(90deg, ${G.gold}, transparent);
          margin: 12px 0;
        }
        .step-detail-card p {
          font-size: 13px;
          color: ${G.textMid};
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .step-detail-card {
            padding: 10px 14px !important;
            border-left-width: 3px !important;
            border-radius: 6px !important;
            background: rgba(10, 9, 9, 0.84) !important;
            border-color: rgba(201, 168, 76, 0.25) !important;
          }
          .step-number {
            font-size: 8px !important;
            margin-bottom: 2px !important;
            letter-spacing: 2px !important;
          }
          .step-detail-card h3 {
            font-size: 13px !important;
            letter-spacing: 1px !important;
          }
          .step-divider {
            margin: 4px 0 !important;
            width: 30px !important;
          }
          .step-detail-card p {
            font-size: 10px !important;
            line-height: 1.35 !important;
          }
        }
      `}</style>
    </div>
  );
}
