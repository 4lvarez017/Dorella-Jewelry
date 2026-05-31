import { A, ORDER_STATUS } from "./AdminTheme";

// ─── Modal de detalle de pedido ───────────────────────────────────────────────
export function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  let parsedItems = [];
  try { parsedItems = JSON.parse(order.items || "[]"); } catch (_) {}

  const fields = [
    ["ID de Pedido",       order.id],
    ["Cliente",            order.customer_name],
    ["Teléfono",           order.phone],
    ["Dirección",          order.address],
    ["Ciudad",             order.city],
    ["Método de Pago",     order.payment_method],
    ["Estado",             order.status],
    ["Total",              `$${(order.total || 0).toLocaleString("es-CO")}`],
    ["Fecha",              order.created_at ? new Date(order.created_at).toLocaleString("es-CO") : "—"],
  ];

  const st = ORDER_STATUS[order.status] || {};

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 540 }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: `1px solid ${A.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24, fontWeight: 600,
              color: A.goldDark, marginBottom: 6,
            }}>
              Detalle del Pedido
            </h3>
            <span
              className="status-badge"
              style={{ background: st.bg, color: st.color }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color, display: "inline-block" }} />
              {order.status}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: "#F0EDE8", border: "none", borderRadius: 8,
            width: 34, height: 34, fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: A.textSecondary, flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Fields */}
        <div style={{ padding: "0 28px" }}>
          {fields.map(([k, v]) => (
            <div key={k} style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "12px 0",
              borderBottom: `1px solid ${A.border}`,
              gap: 12,
            }}>
              <span style={{ fontSize: 12, color: A.textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 14, color: A.textPrimary, fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Items */}
        {parsedItems.length > 0 && (
          <div style={{ padding: "20px 28px 28px" }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: A.goldDark,
              textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12,
            }}>
              Productos del Pedido
            </p>
            <div style={{
              background: A.bg, borderRadius: 10, overflow: "hidden",
              border: `1px solid ${A.border}`,
            }}>
              {parsedItems.map((item, idx) => (
                <div key={idx} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 16px",
                  borderBottom: idx < parsedItems.length - 1 ? `1px solid ${A.border}` : "none",
                }}>
                  <span style={{ fontSize: 13, color: A.textPrimary }}>
                    {item.name}
                    <strong style={{ color: A.goldDark, marginLeft: 6 }}>×{item.qty}</strong>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: A.textPrimary }}>
                    ${(item.price * item.qty).toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "12px 16px",
                background: `${A.gold}10`,
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: A.textPrimary }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: A.goldDark }}>
                  ${(order.total || 0).toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
