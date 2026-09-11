import { useState, useEffect, useRef } from "react";
import { G } from "../../styles/theme";
import Topography from "../Topography";

class GoldParticle {
  constructor(w, h) {
    this.reset(w, h);
    this.y = Math.random() * h;
  }

  reset(w, h) {
    this.x = Math.random() * w;
    this.y = h + 10;
    this.radius = 0.5 + Math.random() * 1.5;
    this.speedY = -(0.2 + Math.random() * 0.4);
    this.speedX = (Math.random() - 0.5) * 0.2;
    this.opacity = 0.12 + Math.random() * 0.35;
    this.oscillation = 0.004 + Math.random() * 0.01;
    this.time = Math.random() * 100;
  }

  update(w, h, mx, my) {
    this.y += this.speedY;
    this.time += this.oscillation;
    this.x += this.speedX + Math.sin(this.time) * 0.15;

    if (mx !== null && my !== null) {
      const dx = this.x - mx;
      const dy = this.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        this.x += (dx / dist) * force * 1.5;
        this.y += (dy / dist) * force * 1.5;
      }
    }

    if (this.y < -10 || this.x < -10 || this.x > w + 10) {
      this.reset(w, h);
    }
  }
}

export function HeroCinematic({ onExplore }) {
  const canvasRef = useRef(null);
  const [mouse, setMouse] = useState({ x: null, y: null });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particleCount = isMobile ? 25 : 55;
    const particles = Array.from({ length: particleCount }, () => new GoldParticle(canvas.width, canvas.height));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update(canvas.width, canvas.height, mouse.x, mouse.y);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 201, 107, ${p.opacity})`;
        ctx.shadowBlur = p.radius * 2;
        ctx.shadowColor = "#C9A84C";
        ctx.fill();
      });
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [mouse, isMobile]);

  const handleMouseMove = (e) => {
    setMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setMouse({ x: null, y: null });
  };

  const scrollToStory = () => {
    const el = document.getElementById("craftsmanship");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0909",
        overflow: "hidden",
        paddingTop: "80px",
      }}
    >
      {/* Layer 1: Ambient WebGL Topography Shader (Subtle Gold/Amber/Olive energy field) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.85,
        }}
      >
        <Topography
          lowColor="#c9a84c"
          midColor="#63390c"
          highColor="#2b3123"
          speed={0.35}
          morphAmount={2.5}
          morphSpeed={0.04}
          bands={1.8}
          thickness={0.008}
          scale={1.8}
          pixelSize={1}
          glow={0.6}
          colorMode="elevation"
          contrast={2.8}
          brightness={0.85}
          fillBands={false}
          opacity={0.9}
          grain
          grainIntensity={0.04}
          mouseInteraction
          mouseRadius={0.3}
          mouseStrength={0.35}
        />
      </div>

      {/* Layer 2: Floating Canvas Particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Layer 3: Central Ambient Light Core (Radial Glow) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "300px" : "650px",
          height: isMobile ? "300px" : "650px",
          background: "radial-gradient(circle, rgba(201, 168, 76, 0.14) 0%, rgba(201, 168, 76, 0.03) 50%, transparent 75%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Layer 4: Soft Edge Vignette Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 35%, rgba(10, 9, 9, 0.7) 75%, #0A0909 100%)",
          pointerEvents: "none",
          zIndex: 4,
        }}
      />

      {/* Layer 5: Hero Content & Seamless Integrated Jewelry Showcase */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "960px",
          padding: "0 24px",
          margin: "auto 0",
        }}
      >
        {/* Subtle Brand Tagline */}
        <div style={{ marginBottom: "16px" }}>
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: G.goldLight,
              fontWeight: 600,
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            DORELLA JEWELRY • EXPERIENCIA INMERSIVA
          </span>
          <div
            style={{
              width: "60px",
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${G.gold}, transparent)`,
              margin: "12px auto 0",
            }}
          />
        </div>

        {/* Minimal Hero Title */}
        <h1
          className="serif"
          style={{
            fontSize: "clamp(38px, 6.5vw, 76px)",
            fontWeight: 300,
            color: G.textDark,
            letterSpacing: "2px",
            lineHeight: 1.1,
            textShadow: "0 4px 20px rgba(0,0,0,0.9)",
            marginBottom: "8px",
          }}
        >
          Joyas en Oro 18K Inalterable
        </h1>

        <p
          style={{
            fontSize: "clamp(13px, 1.5vw, 15px)",
            color: G.textMid,
            maxWidth: "600px",
            lineHeight: 1.7,
            margin: "0 auto 28px",
            fontWeight: 300,
            letterSpacing: "0.5px",
          }}
        >
          Dorella Jewelry diseña alta joyería en oro laminado de 18 quilates. Cada pieza ofrece 100% de resistencia frente al agua, mar y sudor. Respaldamos cada joya con garantía inalterable de fábrica. Realizamos despachos rápidos en 24 a 48 horas a toda Colombia.
        </p>

        {/* Hero Product Visual Stage (Seamlessly feathered into background) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: isMobile ? "270px" : "400px",
            aspectRatio: "1.1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          {/* Subtle warm halo directly under the bracelet */}
          <div
            style={{
              position: "absolute",
              inset: "10%",
              background: "radial-gradient(circle at center, rgba(201, 168, 76, 0.22) 0%, rgba(201, 168, 76, 0.05) 50%, transparent 70%)",
              filter: "blur(25px)",
              pointerEvents: "none",
            }}
          />

          <img
            src="/pulsera_base.jpg"
            alt="Pulsera Dorella Oro 18K"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              WebkitMaskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 32%, rgba(0,0,0,0.75) 54%, rgba(0,0,0,0) 72%)",
              maskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 32%, rgba(0,0,0,0.75) 54%, rgba(0,0,0,0) 72%)",
              filter: "brightness(1.08) contrast(1.05)",
              transform: "scale(1.04)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.09)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          />
        </div>

        {/* Primary Call To Action */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginBottom: isMobile ? "24px" : "32px" }}>
          <button
            className="gold-btn"
            style={{
              padding: "16px 42px",
              fontSize: "12px",
              letterSpacing: "3px",
              boxShadow: "0 10px 30px rgba(201, 168, 76, 0.25)",
            }}
            onClick={onExplore}
          >
            Explorar Catálogo
          </button>
          <button
            onClick={scrollToStory}
            style={{
              background: "rgba(10, 9, 9, 0.6)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(201, 168, 76, 0.3)",
              color: G.textMid,
              padding: "16px 36px",
              fontSize: "12px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = G.gold;
              e.currentTarget.style.color = G.textDark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.3)";
              e.currentTarget.style.color = G.textMid;
            }}
          >
            Ver Proceso
          </button>
        </div>
      </div>

      {/* Scroll Down Hint Indicator */}
      {!isMobile && (
        <div
          onClick={scrollToStory}
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            opacity: 0.7,
            transition: "opacity 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: G.goldLight,
              fontWeight: 600,
            }}
          >
            DESLIZA PARA DESCUBRIR
          </span>
          <div
            style={{
              width: "16px",
              height: "26px",
              border: `1.5px solid ${G.gold}`,
              borderRadius: "10px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "5px",
                background: G.goldLight,
                borderRadius: "50%",
                position: "absolute",
                left: "50%",
                top: "5px",
                transform: "translateX(-50%)",
                animation: "heroMouseWheel 1.8s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes heroMouseWheel {
          0% { top: 5px; opacity: 1; }
          100% { top: 14px; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
