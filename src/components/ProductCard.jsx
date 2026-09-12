import { useState } from "react";
import { G } from "../styles/theme";
import { useCart } from "../context/CartContext";
import { useFadeIn } from "../hooks/useFadeIn";

// ─── Skeleton mientras carga la imagen ────────────────────────────────────────
function ImageSkeleton() {
  return (
    <div style={{
      width: "100%", aspectRatio: "1",
      background: `linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s infinite",
    }} />
  );
}

export function ProductCard({ product, dark = false, onViewDetails }) {
  const { dispatch } = useCart();
  const ref = useFadeIn();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cardClass = dark ? "dark-product-card fade-in" : "product-card fade-in";
  const imgSrc = imgError ? "/placeholder.jpg" : (product.image || "/placeholder.jpg");

  return (
    <div
      ref={ref}
      className={cardClass}
      onClick={() => onViewDetails && onViewDetails(product)}
    >
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ overflow: "hidden", position: "relative" }}>
        {/* Skeleton visible mientras la imagen no cargó */}
        {!imgLoaded && <ImageSkeleton />}

        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width="320"
          height="320"
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
          style={{
            position: imgLoaded ? "relative" : "absolute",
            top: 0, left: 0,
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.4s ease",
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />

        <div className="overlay-add">
          <button
            className="gold-btn"
            style={{ fontSize: "11px", padding: "10px 20px" }}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "ADD", item: product });
            }}
          >
            Agregar al carrito
          </button>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <span className="tag">{product.category}</span>
        <p
          className="serif"
          style={{
            fontSize: "18px",
            fontWeight: 500,
            marginTop: "8px",
            color: dark ? G.white : G.textDark,
          }}
        >
          {product.name}
        </p>
        <p
          className="product-desc"
          style={{
            fontSize: "12px",
            color: dark ? "rgba(255,255,255,0.5)" : G.textMuted,
            marginTop: "4px",
            lineHeight: 1.5,
            minHeight: "36px",
          }}
        >
          {product.desc}
        </p>
        <p style={{ color: G.gold, fontWeight: 600, fontSize: "16px", marginTop: "10px" }}>
          ${product.price.toLocaleString("es-CO")}
        </p>
      </div>
    </div>
  );
}
