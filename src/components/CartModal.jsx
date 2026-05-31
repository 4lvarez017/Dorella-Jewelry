import { G } from "../styles/theme";
import { useCart } from "../context/CartContext";

export function CartModal({ onClose, onCheckout }) {
  const { cart, dispatch, total } = useCart();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            background: G.carbon,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 className="serif" style={{ color: G.textDark, fontSize: "22px", fontWeight: 400 }}>
            🛒 Mi Carrito
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: G.textDark, fontSize: "24px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ padding: "24px", maxHeight: "400px", overflowY: "auto" }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: "center", color: G.textMuted, padding: "40px 0" }}>
              Tu carrito está vacío
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  marginBottom: "20px",
                  paddingBottom: "20px",
                  borderBottom: `1px solid ${G.creamDark}`,
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: "70px", height: "70px", objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: "15px" }}>{item.name}</p>
                  <p style={{ color: G.gold, fontSize: "14px" }}>
                    ${item.price.toLocaleString("es-CO")}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                    <button
                      onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty - 1 })}
                      style={{ width: "24px", height: "24px", background: G.creamDark, border: "none", cursor: "pointer", fontWeight: 700 }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: "14px" }}>{item.qty}</span>
                    <button
                      onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty + 1 })}
                      style={{ width: "24px", height: "24px", background: G.creamDark, border: "none", cursor: "pointer", fontWeight: 700 }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                      style={{ marginLeft: "8px", background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: "12px" }}
                    >
                      ✕ Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con total */}
        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: `1px solid ${G.creamDark}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontWeight: 500 }}>Total</span>
              <span style={{ color: G.gold, fontWeight: 700, fontSize: "20px" }}>
                ${total.toLocaleString("es-CO")}
              </span>
            </div>
            <button
              className="gold-btn"
              style={{ width: "100%" }}
              onClick={() => { onClose(); onCheckout(); }}
            >
              Proceder al Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
