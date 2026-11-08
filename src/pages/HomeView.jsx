import { useState, useEffect } from "react";
import { G } from "../styles/theme";
import { WHATSAPP_NUMBER } from "../data/constants";
import { useCart } from "../context/CartContext";
import { HomeNavbar } from "../components/home/HomeNavbar";
import { HeroCinematic } from "../components/home/HeroCinematic";
import { CraftsmanshipStory } from "../components/home/CraftsmanshipStory";
import { EditorialCollections } from "../components/home/EditorialCollections";
import { FeaturedCurated } from "../components/home/FeaturedCurated";
import { GoldComparisonTable } from "../components/home/GoldComparisonTable";
import { BrandNarrative } from "../components/home/BrandNarrative";
import { HomeFAQ } from "../components/home/HomeFAQ";
import { Footer } from "../components/Footer";
import { CartModal } from "../components/CartModal";
import { CheckoutModal } from "../components/CheckoutModal";

export function HomeView({ setPage, onSelectCategory, onViewDetails }) {
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div style={{ background: G.cream, minHeight: "100vh", overflowX: "hidden" }}>
      {/* 1. Refined Minimal Glassmorphic Navbar */}
      <HomeNavbar
        onNavigate={setPage}
        onSelectCategory={onSelectCategory}
        cartCount={totalItems}
        onOpenCart={() => setCartOpen(true)}
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

      {/* 6. Technical Proof: Comparative Table 18K vs Conventional & Key Metrics */}
      <GoldComparisonTable />

      {/* 7. Scene 06: Brand Narrative (Ocaña & Montería Roots) */}
      <BrandNarrative />

      {/* 7. Scene 07: Verified FAQ & Direct AEO/GEO Inverted Pyramid Answers */}
      <HomeFAQ />

      {/* 8. Footer with Enhanced NAP */}
      <Footer />

      {/* FABs flotantes (Carrito y WhatsApp) */}
      <button className="cart-fab" onClick={() => setCartOpen(true)} aria-label="Ver carrito">
        🛒
        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </button>
      <button
        className="whatsapp-fab"
        onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank")}
        aria-label="Chat por WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

      {/* Modales de compra */}
      {cartOpen && (
        <CartModal
          onClose={() => setCartOpen(false)}
          onCheckout={() => setCheckoutOpen(true)}
        />
      )}
      {checkoutOpen && (
        <CheckoutModal
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
