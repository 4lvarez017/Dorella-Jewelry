import { G } from "../styles/theme";
import { useCart } from "../context/CartContext";
import { useFadeIn } from "../hooks/useFadeIn";

export function ProductCard({ product, dark = false, onViewDetails }) {
  const { dispatch } = useCart();
  const ref = useFadeIn();

  const cardClass = dark ? "dark-product-card fade-in" : "product-card fade-in";

  return (
    <div 
      ref={ref} 
      className={cardClass}
      onClick={() => onViewDetails && onViewDetails(product)}
    >
      <div style={{ overflow: "hidden", position: "relative" }}>
        <img src={product.image || "/placeholder.jpg"} alt={product.name} />
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
