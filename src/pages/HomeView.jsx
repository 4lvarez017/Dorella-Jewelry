import { useEffect } from "react";
import { G } from "../styles/theme";
import { HomeNavbar } from "../components/home/HomeNavbar";
import { HeroCinematic } from "../components/home/HeroCinematic";
import { CraftsmanshipStory } from "../components/home/CraftsmanshipStory";
import { EditorialCollections } from "../components/home/EditorialCollections";
import { FeaturedCurated } from "../components/home/FeaturedCurated";
import { BrandNarrative } from "../components/home/BrandNarrative";
import { Footer } from "../components/Footer";

export function HomeView({ setPage, onSelectCategory, onViewDetails }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div style={{ background: G.cream, minHeight: "100vh", overflowX: "hidden" }}>
      {/* 1. Refined Minimal Glassmorphic Navbar */}
      <HomeNavbar
        onNavigate={setPage}
        onSelectCategory={onSelectCategory}
      />

      {/* 2. Scene 01: Continuous Cinematic Hero Stage with WebGL Topography & Integrated Jewelry */}
      <HeroCinematic
        onExplore={() => {
          onSelectCategory("Todos");
          setPage("catalog");
        }}
      />

      {/* 3. Scene 02 & 03: 18K Gold Craftsmanship & 5-Layer Engineering Story */}
      <CraftsmanshipStory />

      {/* 4. Scene 04: Luxury Editorial Category Collections */}
      <EditorialCollections
        onSelectCategory={onSelectCategory}
        onNavigate={setPage}
      />

      {/* 5. Scene 05: Curated Featured Jewelry Selection */}
      <FeaturedCurated
        onViewDetails={onViewDetails}
        onNavigate={setPage}
      />

      {/* 6. Scene 06: Brand Narrative (Ocaña & Montería Roots) */}
      <BrandNarrative />

      {/* 7. Footer */}
      <Footer />

      {/* Admin Panel Link */}
      <div
        onClick={() => setPage("admin")}
        style={{
          textAlign: "center",
          padding: "14px",
          background: G.black,
          fontSize: "10px",
          color: "rgba(255, 255, 255, 0.25)",
          cursor: "pointer",
          letterSpacing: "2px",
          textTransform: "uppercase",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = G.gold)}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.25)")}
      >
        Acceso Panel Administración
      </div>
    </div>
  );
}
