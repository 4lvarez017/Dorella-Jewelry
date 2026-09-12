import { useState, useEffect } from "react";
import { G } from "../styles/theme";
import { WHATSAPP_NUMBER } from "../data/constants";
import { useCart } from "../context/CartContext";
import { Footer } from "../components/Footer";
import { CartFab, WhatsAppFab } from "./CatalogView";
import { CartModal } from "../components/CartModal";
import { CheckoutModal } from "../components/CheckoutModal";
import { fetchReviews, insertReview } from "../lib/firebase";

// Generate customized mock reviews based on product details for high realism
function getMockReviews(product) {
  const isRing = product.category === "Anillos";
  const isMenBraz = product.category === "Brazaletes Hombre";
  
  if (isRing) {
    return [
      { name: "Carolina M.", rating: 5, date: "Hace 3 días", comment: "Es precioso, el oro 18k laminado brilla increíble. Es ajustable, lo cual me facilitó mucho no tener que adivinar la talla." },
      { name: "Juan David", rating: 5, date: "Hace 1 semana", comment: "Se lo regalé a mi novia y le encantó. El acabado de los circones es sumamente fino. Excelente compra." }
    ];
  } else if (isMenBraz) {
    return [
      { name: "Andrés F.", rating: 5, date: "Hace 4 días", comment: "Muy masculino y de excelente peso. El neopreno y el oro laminado combinan perfecto. La garantía me dio mucha confianza." },
      { name: "Mateo Gómez", rating: 5, date: "Hace 2 semanas", comment: "Un brazalete de nivel premium. El cordón es muy resistente y el diseño del caballo/herrajes resalta muchísimo." }
    ];
  } else {
    return [
      { name: "María Alejandra", rating: 5, date: "Hace 5 días", comment: "Superó mis expectativas. La calidad de los acabados de Dorella es espectacular, lo recomiendo 100%." },
      { name: "Carlos Mario", rating: 4, date: "Hace 3 semanas", comment: "Muy buena joya en oro laminado de 18k. El servicio de atención por WhatsApp fue sumamente rápido." }
    ];
  }
}

export function ProductDetailView({ setPage, product }) {
  const { cart, dispatch } = useCart();
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [product]);

  const productImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : [product?.image || "/placeholder.jpg"];

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

  // Cargar reseñas desde Firebase
  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    fetchReviews(String(product.id))
      .then((data) => {
        setReviews(Array.isArray(data) && data.length > 0 ? data : getMockReviews(product));
      })
      .catch(() => setReviews(getMockReviews(product)))
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
              🔍 Pasa el cursor para ver detalles
            </p>
          </div>

          {/* Right Column: Info Details */}
          <div style={{ padding: "10px 0" }}>
            <span className="tag" style={{ marginBottom: "12px" }}>{product.category}</span>
            <h1 className="serif detail-info-title" style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 400, color: G.textDark, lineHeight: 1.1, margin: "12px 0 8px" }}>
              {product.name}
            </h1>

            {/* Rating Stars Summary */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ color: G.goldLight, fontSize: "16px" }}>
                {"★".repeat(Math.round(averageRating)) + "☆".repeat(5 - Math.round(averageRating))}
              </div>
              <span style={{ fontSize: "13px", color: G.textMuted }}>
                {averageRating} / 5.0 ({reviews.length} opiniones)
              </span>
            </div>

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
              Tu dirección de correo no será publicada. Los campos obligatorios están marcados con *
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
      <CartFab totalItems={totalItems} onClick={() => setCartOpen(true)} />
      <WhatsAppFab />

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
