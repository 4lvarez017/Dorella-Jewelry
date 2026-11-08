import { useState, useEffect } from "react";
import { G } from "../styles/theme";
import { WHATSAPP_NUMBER } from "../data/constants";
import { useCart } from "../context/CartContext";
import { Footer } from "../components/Footer";
import { CartModal } from "../components/CartModal";
import { CheckoutModal } from "../components/CheckoutModal";
import { fetchReviews, insertReview } from "../lib/firebase";

export function ProductDetailView({ setPage, product }) {
  const { cart, dispatch } = useCart();
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Reset active image index & update dynamic SEO tags when product changes
  useEffect(() => {
    setActiveImageIdx(0);
    if (!product) return;

    const prevTitle = document.title;
    document.title = `${product.name} | ${product.category} en Oro 18K | Dorella Jewelry`;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") || "";
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        `${product.name} en oro laminado 18K inalterable ($${Number(product.price || 0).toLocaleString("es-CO")} COP). ${product.desc || "Resistente al agua y sudor con garantía por escrito y envío a toda Colombia."}`
      );
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute("href") || "https://dorella-jewelry.vercel.app/";
    if (canonical) {
      canonical.setAttribute("href", `https://dorella-jewelry.vercel.app/?page=product&productId=${encodeURIComponent(product.id)}`);
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute("content", prevDesc);
      if (canonical) canonical.setAttribute("href", prevCanonical);
    };
  }, [product]);

  const productImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : [product?.image || "/pulsera_base.webp"];

  // Modals state
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  // Review form states
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  // Cargar reseñas reales desde Firebase (sin reseñas ficticias)
  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    fetchReviews(String(product.id))
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [product]);

  if (!product) {
    return (
      <div style={{ padding: "80px", textAlign: "center", background: G.cream, color: G.textDark }}>
        <p className="serif" style={{ fontSize: "24px" }}>Producto no encontrado</p>
        <button className="gold-btn" style={{ marginTop: "20px" }} onClick={() => setPage("catalog")}>
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch({ type: "ADD_MULTIPLE", item: product, qty: qty });
    setCartOpen(true); // Open the cart so they see their item added!
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await insertReview({
        productId: String(product.id),
        name:      newName.trim(),
        rating:    newRating,
        comment:   newComment.trim(),
      });
      // Recargar reseñas desde Firebase para reflejar el orden real
      const updated = await fetchReviews(String(product.id));
      setReviews(Array.isArray(updated) ? updated : []);
      // Limpiar formulario
      setNewName("");
      setNewRating(5);
      setNewComment("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch {
      setSubmitError("Error al publicar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div style={{ background: G.cream, minHeight: "100vh", color: G.textDark, fontFamily: "'Jost', sans-serif", position: "relative" }}>
      {/* Sticky Top Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 900,
          background: G.white,
          borderBottom: `1px solid ${G.creamDark}`,
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => setPage("catalog")}
          style={{
            background: "rgba(18, 17, 16, 0.7)",
            border: "1px solid rgba(201, 168, 76, 0.25)",
            color: G.textMid,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            borderRadius: "1px",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = G.gold;
            e.currentTarget.style.color = G.textDark;
            e.currentTarget.style.background = "rgba(201, 168, 76, 0.12)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(201, 168, 76, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.25)";
            e.currentTarget.style.color = G.textMid;
            e.currentTarget.style.background = "rgba(18, 17, 16, 0.7)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span style={{ fontSize: "14px", color: G.gold }}>←</span> Volver
        </button>
        <div 
          onClick={() => setPage("home")}
          style={{ 
            textAlign: "center",
            cursor: "pointer",
            transition: "opacity 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 0.85}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
        >
          <p className="serif" style={{ fontSize: "22px", color: G.gold, fontWeight: 500, lineHeight: 1 }}>
            Dorella Jewelry
          </p>
          <span style={{ fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", color: G.textMuted }}>
            Detalle Exclusivo
          </span>
        </div>
        <div style={{ width: "110px", display: "flex", justifyContent: "flex-end" }} />
      </header>

      {/* Estilos responsivos locales para celulares */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .detail-container {
            padding: 20px 16px 60px !important;
          }
          .detail-grid {
            gap: 30px !important;
            margin-bottom: 40px !important;
            grid-template-columns: 1fr !important;
          }
          .detail-image-box {
            padding: 12px !important;
          }
          .detail-info-title {
            font-size: 28px !important;
            margin-top: 8px !important;
          }
        }
      `}</style>

      {/* Main product card view wrapper */}
      <div className="detail-container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px 100px" }}>
        <div 
          className="detail-grid"
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
            gap: "60px",
            alignItems: "start",
            marginBottom: "80px"
          }}
        >
          {/* Left Column: Image Display */}
          <div 
            className="detail-image-box"
            style={{ 
              background: G.white, 
              border: `1px solid ${G.creamDark}`,
              padding: "20px",
              borderRadius: "2px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              textAlign: "center"
            }}
          >
            <div className="premium-img-container" style={{ width: "100%", aspectRatio: "1", borderRadius: "1px", border: `1px solid rgba(201,168,76,0.1)`, overflow: "hidden" }}>
              <img 
                src={productImages[activeImageIdx]} 
                alt={product.name} 
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.3s ease" }}
              />
            </div>

            {/* Fila de miniaturas si hay múltiples imágenes */}
            {productImages.length > 1 && (
              <div 
                style={{ 
                  display: "flex", 
                  gap: "10px", 
                  marginTop: "12px", 
                  justifyContent: "center", 
                  overflowX: "auto", 
                  paddingBottom: "6px" 
                }}
              >
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: "60px",
                      height: "60px",
                      padding: 0,
                      border: idx === activeImageIdx ? `2px solid ${G.gold}` : `1px solid ${G.creamDark}`,
                      background: G.white,
                      cursor: "pointer",
                      borderRadius: "2px",
                      overflow: "hidden",
                      transition: "all 0.2s",
                      flexShrink: 0
                    }}
                  >
                    <img src={img} alt={`${product.name} - ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}

            <p style={{ marginTop: "16px", color: G.textMuted, fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>
              ✨ Oro Laminado 18K · Garantía por Escrito
            </p>
          </div>

          {/* Right Column: Info Details */}
          <div style={{ padding: "10px 0" }}>
            <span className="tag" style={{ marginBottom: "12px" }}>{product.category}</span>
            <h1 className="serif detail-info-title" style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 400, color: G.textDark, lineHeight: 1.1, margin: "12px 0 8px" }}>
              {product.name}
            </h1>

            {/* Rating Stars Summary (solo cuando existen reseñas reales) */}
            {reviews.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ color: G.goldLight, fontSize: "16px" }}>
                  {"★".repeat(Math.round(averageRating)) + "☆".repeat(5 - Math.round(averageRating))}
                </div>
                <span style={{ fontSize: "13px", color: G.textMuted }}>
                  {averageRating} / 5.0 ({reviews.length} {reviews.length === 1 ? "opinión" : "opiniones"})
                </span>
              </div>
            )}

            {/* Price & Material */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px", paddingBottom: "24px", borderBottom: `1px solid ${G.creamDark}` }}>
              <span style={{ fontSize: "32px", fontWeight: 600, color: G.goldLight }}>
                ${product.price.toLocaleString("es-CO")}
              </span>
              <span 
                style={{ 
                  background: "rgba(201,168,76,0.06)", 
                  border: `1px solid rgba(201,168,76,0.2)`, 
                  padding: "4px 12px", 
                  fontSize: "11px", 
                  color: G.goldLight,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}
              >
                🛡️ Oro 18K Laminado
              </span>
            </div>

            {/* Description */}
            <p style={{ color: G.textMid, lineHeight: 1.8, fontSize: "15px", marginBottom: "32px" }}>
              {product.desc}
              <br /><br />
              Nuestras piezas cuentan con un recubrimiento certificado de oro de 18 quilates laminado sobre una base premium, asegurando la máxima durabilidad y un brillo inalterable al paso del tiempo. Hipoalergénico y resistente.
            </p>

            {/* Controls Box */}
            <div 
              style={{ 
                background: G.white, 
                border: `1px solid ${G.creamDark}`, 
                padding: "24px", 
                borderRadius: "2px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              {/* Qty Selector */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 500, color: G.textMid, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Cantidad:
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={{
                      width: "36px",
                      height: "36px",
                      background: G.creamDark,
                      border: "none",
                      color: G.textDark,
                      fontSize: "18px",
                      fontWeight: 600,
                      cursor: "pointer",
                      borderRadius: "1px",
                      transition: "opacity 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
                  >
                    −
                  </button>
                  <span style={{ fontSize: "18px", fontWeight: 600, minWidth: "24px", textAlign: "center" }}>{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    style={{
                      width: "36px",
                      height: "36px",
                      background: G.creamDark,
                      border: "none",
                      color: G.textDark,
                      fontSize: "18px",
                      fontWeight: 600,
                      cursor: "pointer",
                      borderRadius: "1px",
                      transition: "opacity 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                <button className="gold-btn" style={{ width: "100%", padding: "16px 20px" }} onClick={handleAddToCart}>
                  Agregar al Carrito
                </button>
                <button 
                  className="gold-outline-btn" 
                  style={{ width: "100%", padding: "12px 20px", borderColor: G.textMuted, color: G.textDark }}
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20estoy%20interesado%20en%20el%20producto%20${encodeURIComponent(product.name)}`, "_blank")}
                >
                  Consultar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: "1px", background: G.creamDark, margin: "60px 0" }} />

        {/* Bottom Section: Opinions & Form */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px" }}>
          {/* Left Column: Reviews List */}
          <div>
            <h3 className="serif" style={{ fontSize: "32px", color: G.gold, fontWeight: 400, marginBottom: "32px" }}>
              Opiniones de Clientes
            </h3>
            
            {reviewsLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: G.textMuted, padding: "20px 0" }}>
                <div style={{
                  width: 18, height: 18,
                  border: `2px solid ${G.creamDark}`,
                  borderTopColor: G.gold,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  flexShrink: 0,
                }} />
                Cargando opiniones...
              </div>
            ) : reviews.length === 0 ? (
              <p style={{ color: G.textMuted }}>No hay opiniones sobre este producto todavía. ¡Sé el primero en calificarlo!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {reviews.map((rev) => (
                  <div
                    key={rev.id || rev.created_at}
                    style={{
                      background: G.white,
                      border: `1px solid ${G.creamDark}`,
                      padding: "20px",
                      borderRadius: "2px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 600, color: G.textDark, fontSize: "14px" }}>{rev.name}</span>
                      <span style={{ fontSize: "11px", color: G.textMuted }}>
                        {rev.created_at
                          ? new Date(rev.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
                          : "Hoy"}
                      </span>
                    </div>
                    <div style={{ color: G.goldLight, fontSize: "12px", marginBottom: "10px" }}>
                      {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                    </div>
                    <p style={{ color: G.textMid, fontSize: "13px", lineHeight: 1.6 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Write a Review Form */}
          <div 
            style={{ 
              background: G.white, 
              border: `1px solid ${G.creamDark}`, 
              padding: "32px", 
              borderRadius: "2px" 
            }}
          >
            <h3 className="serif" style={{ fontSize: "28px", color: G.textDark, fontWeight: 400, marginBottom: "8px" }}>
              Escribe tu opinión
            </h3>
            <p style={{ fontSize: "13px", color: G.textMuted, marginBottom: "24px" }}>
              Comparte tu experiencia con esta pieza. Los campos obligatorios están marcados con *
            </p>

            <form onSubmit={handleAddReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 500, color: G.textMid, textTransform: "uppercase" }}>Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: G.cream,
                    border: `1px solid ${G.creamDark}`,
                    color: G.textDark,
                    fontSize: "14px",
                    marginTop: "6px",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 500, color: G.textMid, textTransform: "uppercase" }}>Calificación *</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "24px",
                        color: star <= newRating ? G.goldLight : G.textMuted,
                        cursor: "pointer",
                        padding: 0
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 500, color: G.textMid, textTransform: "uppercase" }}>Tu Comentario *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Escribe aquí tu experiencia..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: G.cream,
                    border: `1px solid ${G.creamDark}`,
                    color: G.textDark,
                    fontSize: "14px",
                    marginTop: "6px",
                    resize: "none"
                  }}
                />
              </div>

              {submitSuccess && (
                <p style={{ color: "#27ae60", fontSize: "13px" }}>
                  ✅ ¡Gracias! Tu opinión ha sido publicada y ya es visible para todos.
                </p>
              )}
              {submitError && (
                <p style={{ color: "#e74c3c", fontSize: "13px" }}>⚠️ {submitError}</p>
              )}

              <button
                type="submit"
                className="gold-btn"
                style={{ padding: "12px", fontSize: "12px", marginTop: "8px", opacity: submitting ? 0.7 : 1 }}
                disabled={submitting}
              >
                {submitting ? "Publicando..." : "Publicar Opinión"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* FABs flotantes */}
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

      {/* Modales del carrito */}
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
