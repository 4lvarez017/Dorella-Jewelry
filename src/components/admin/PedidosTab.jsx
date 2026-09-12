import { useState } from "react";
import { A, ORDER_STATUS } from "./AdminTheme";

// ─── Timeline visual de estado del pedido ────────────────────────────────────
function OrderTimeline({ status }) {
  const steps = [
    { key: "Pendiente",  label: "Pendiente",  icon: "🕐" },
    { key: "Enviado",    label: "Enviado",    icon: "🚚" },
    { key: "Completado", label: "Completado", icon: "✅" },
  ];
  const activeIdx = steps.findIndex(s => s.key === status);

  return (
    <div className="order-timeline" style={{ gap: 0, marginTop: 10 }}>
      {steps.map((step, idx) => {
        const done    = idx <= activeIdx;
        const current = idx === activeIdx;
        const st = ORDER_STATUS[step.key] || {};
        return (
          <div key={step.key} className="order-timeline-step" style={{ flex: 1 }}>
            {/* Línea antes */}
            {idx > 0 && (
              <div className="order-timeline-line" style={{
                flex: 1, height: 2, background: idx <= activeIdx ? A.gold : A.border,
                alignSelf: "center", marginTop: 0,
                transition: "background 0.4s",
              }} />
            )}
            {/* Punto */}
            <div className="order-timeline-dot" style={{
              width: 26, height: 26, borderRadius: "50%",
              background: done ? (current ? `${A.gold}20` : A.goldBg) : A.bg,
              border: `2px solid ${done ? A.gold : A.border}`,
              fontSize: 12,
              transition: "all 0.3s",
              boxShadow: current ? `0 0 0 3px ${A.gold}25` : "none",
            }}>
              {step.icon}
            </div>
            {/* Label */}
            <span style={{
              marginTop: 5, fontSize: 10, fontWeight: done ? 700 : 500,
              color: done ? A.goldDark : A.textMuted,
              transition: "color 0.3s",
            }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Modal de detalle del pedido ─────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onStatusChange, onDelete, showConfirm }) {
  const items = (() => {
    try { return JSON.parse(order.items || "[]"); }
    catch (_) { return []; }
  })();
  const st = ORDER_STATUS[order.status] || {};

  const handleDelete = () => {
    if (showConfirm) {
      showConfirm(`¿Eliminar el pedido ${order.id}? Esta acción es permanente.`, () => {
        onDelete(order.id);
        onClose();
      });
    } else if (confirm(`¿Eliminar pedido ${order.id}?`)) {
      onDelete(order.id);
      onClose();
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520 }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${A.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{
              fontSize: 11, letterSpacing: "2px", fontWeight: 700,
              color: A.textMuted, textTransform: "uppercase", marginBottom: 2,
            }}>
              Detalle
            </div>
            <h3 style={{
              fontSize: 20, fontWeight: 600, color: A.textPrimary,
              fontFamily: "monospace",
            }}>
              {order.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F0EDE8", border: "none", borderRadius: 8,
              width: 34, height: 34, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: A.textSecondary, flexShrink: 0, transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = A.goldBg}
            onMouseLeave={e => e.currentTarget.style.background = "#F0EDE8"}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Timeline */}
          <div style={{
            background: A.bg, borderRadius: 10, padding: "14px 16px",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: A.textSecondary, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
              Estado del Pedido
            </p>
            <OrderTimeline status={order.status} />
          </div>

          {/* Info del cliente */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: A.textSecondary, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
              Datos del Cliente
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
              {[
                { label: "Nombre", value: order.customer_name },
                { label: "Teléfono", value: order.phone },
                { label: "Dirección", value: order.address },
                { label: "Ciudad", value: order.city },
                { label: "Método de Pago", value: order.payment_method },
                { label: "Fecha", value: order.created_at ? new Date(order.created_at).toLocaleDateString("es-CO") : "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: A.textMuted, textTransform: "uppercase" }}>{label}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: A.textPrimary, marginTop: 2 }}>{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Productos */}
          {items.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: A.textSecondary, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                Productos
              </p>
              <div style={{ background: A.bg, borderRadius: 10, overflow: "hidden" }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px",
                    borderBottom: idx < items.length - 1 ? `1px solid ${A.border}` : "none",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: A.textPrimary }}>
                      {item.name} <span style={{ color: A.textMuted }}>×{item.qty}</span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: A.goldDark }}>
                      ${((item.price || 0) * item.qty).toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "12px 14px",
                  borderTop: `2px solid ${A.border}`,
                  background: A.cardBg,
                }}>
                  <span style={{ fontWeight: 700, color: A.textPrimary }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: A.goldDark }}>
                    ${(order.total || 0).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cambiar estado */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: A.textSecondary, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
              Cambiar Estado
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {["Pendiente", "Enviado", "Completado"].map(s => {
                const sObj = ORDER_STATUS[s] || {};
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(order.id, s)}
                    style={{
                      flex: 1, padding: "10px 0",
                      borderRadius: 10, fontSize: 12, fontWeight: 600,
                      border: `2px solid ${order.status === s ? sObj.color : A.border}`,
                      background: order.status === s ? sObj.bg : A.cardBg,
                      color: order.status === s ? sObj.color : A.textSecondary,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { if (order.status !== s) e.currentTarget.style.borderColor = sObj.color; }}
                    onMouseLeave={e => { if (order.status !== s) e.currentTarget.style.borderColor = A.border; }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px 20px",
          borderTop: `1px solid ${A.border}`,
          display: "flex", justifyContent: "space-between", gap: 12,
        }}>
          <button
            className="admin-btn-danger"
            style={{ padding: "10px 18px", fontSize: 12 }}
            onClick={handleDelete}
          >
            🗑 Eliminar Pedido
          </button>
          <button className="admin-btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card de pedido (móvil) ───────────────────────────────────────────────────
function OrderCard({ o, onViewDetail, onStatusChange, onDelete }) {
  const st = ORDER_STATUS[o.status] || {};
  return (
    <div style={{
      background: A.cardBg, border: `1px solid ${A.border}`,
      borderRadius: 12, padding: "16px",
      boxShadow: A.shadowSm,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* Fila superior */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: A.textPrimary, marginBottom: 2 }}>
            {o.customer_name}
          </p>
          <p style={{ fontSize: 11, color: A.textMuted, fontFamily: "monospace" }}>{o.id}</p>
        </div>
        <span className="status-badge" style={{ background: st.bg, color: st.color, flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color, display: "inline-block" }} />
          {o.status}
        </span>
      </div>

      {/* Info */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: A.textSecondary }}>
          📍 {o.city || "—"}
        </span>
        <span style={{ fontSize: 12, color: A.textSecondary }}>
          💳 {o.payment_method}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: A.goldDark, marginLeft: "auto" }}>
          ${(o.total || 0).toLocaleString("es-CO")}
        </span>
      </div>

      {/* Timeline (compacto) */}
      <OrderTimeline status={o.status} />

      {/* Cambiar estado inline */}
      <select
        value={o.status}
        onChange={e => onStatusChange(o.id, e.target.value)}
        style={{
          border: `1px solid ${st.color}50`, color: st.color, background: st.bg,
          padding: "8px 10px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: "pointer", outline: "none", fontFamily: "'Jost', sans-serif", width: "100%",
        }}
      >
        <option value="Pendiente" style={{ color: A.textPrimary, background: "#FFF" }}>🕐 Pendiente</option>
        <option value="Enviado"   style={{ color: A.textPrimary, background: "#FFF" }}>🚚 Enviado</option>
        <option value="Completado" style={{ color: A.textPrimary, background: "#FFF" }}>✅ Completado</option>
      </select>

      {/* Acciones */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onViewDetail(o)}
          className="admin-btn-secondary"
          style={{ fontSize: 12, padding: "8px 0", flex: 1 }}
        >
          Ver Detalle Completo →
        </button>
        <button
          onClick={() => onDelete(o)}
          className="admin-btn-danger"
          style={{ padding: "8px 12px", fontSize: 14, borderRadius: 8, lineHeight: 1 }}
          title="Eliminar pedido"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

// ─── Tab Principal ────────────────────────────────────────────────────────────
export function PedidosTab({
  orders, loadingOrders, databaseAvailable,
  onStatusChange, onRefresh, onExportPDF, onExportExcel, onDeleteOrder, showConfirm,
}) {
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === "Todos" || o.status === filterStatus;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.id || "").toLowerCase().includes(q) ||
      (o.city || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    Todos:     orders.length,
    Pendiente: orders.filter(o => o.status === "Pendiente").length,
    Enviado:   orders.filter(o => o.status === "Enviado").length,
    Completado:orders.filter(o => o.status === "Completado").length,
  };

  const handleDeleteOrder = (order) => {
    if (showConfirm) {
      showConfirm(`¿Eliminar el pedido de "${order.customer_name}" (${order.id}) permanentemente?`, () => {
        onDeleteOrder(order.id);
      });
    } else if (confirm(`¿Eliminar pedido ${order.id}?`)) {
      onDeleteOrder(order.id);
    }
  };

  return (
    <>
      <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Banner Base de datos offline ── */}
        {!databaseAvailable && (
          <div style={{
            background: A.warningBg, border: `1px solid ${A.warning}40`,
            borderRadius: 10, padding: "12px 16px",
            display: "flex", gap: 10, alignItems: "center", fontSize: 13,
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ color: A.warning, fontWeight: 500 }}>
              Base de datos no disponible — mostrando pedidos guardados localmente.
            </span>
          </div>
        )}

        {/* ── Barra de controles ── */}
        <div style={{
          background: A.cardBg, border: `1px solid ${A.border}`,
          borderRadius: 14, padding: "16px 18px",
          boxShadow: A.shadowSm, display: "flex", flexDirection: "column", gap: 12,
        }}>
          {/* Búsqueda + acciones */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)", fontSize: 15, color: A.textMuted, pointerEvents: "none",
              }}>🔍</span>
              <input
                className="admin-input"
                type="text"
                placeholder="Buscar por cliente, ID o ciudad..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
            <button
              onClick={onRefresh}
              className="admin-btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
            >
              🔄 Actualizar
            </button>
            <button
              onClick={onExportPDF}
              className="admin-btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
            >
              📄 PDF
            </button>
            <button
              onClick={onExportExcel}
              className="admin-btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
            >
              📊 Excel
            </button>
          </div>

          {/* Chips de estado */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Todos", "Pendiente", "Enviado", "Completado"].map(s => {
              const sObj = ORDER_STATUS[s] || {};
              return (
                <button
                  key={s}
                  className={`filter-chip${filterStatus === s ? " active" : ""}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s !== "Todos" && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sObj.color || A.gold, display: "inline-block" }} />
                  )}
                  {" "}{s}
                  {counts[s] > 0 && (
                    <span style={{
                      marginLeft: 5, fontSize: 10, fontWeight: 700,
                      background: filterStatus === s ? `${A.gold}25` : A.bg,
                      color: filterStatus === s ? A.goldDark : A.textMuted,
                      borderRadius: 10, padding: "1px 6px",
                    }}>
                      {counts[s]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Contenido ── */}
        {loadingOrders ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="admin-skeleton" style={{ height: 60, borderRadius: 12 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: A.cardBg, border: `1px solid ${A.border}`,
            borderRadius: 14, padding: "60px 24px",
            textAlign: "center", boxShadow: A.shadowSm,
          }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🧾</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: A.textPrimary, marginBottom: 6 }}>
              Sin pedidos
            </p>
            <p style={{ fontSize: 13, color: A.textMuted }}>
              {search ? "No encontramos pedidos con esa búsqueda." : "No hay pedidos en este estado aún."}
            </p>
          </div>
        ) : (
          <>
            {/* ── Desktop: tabla ── */}
            <style>{`
              @media (max-width: 768px) {
                .orders-table-desktop { display: none !important; }
                .orders-cards-mobile  { display: flex !important; }
              }
              @media (min-width: 769px) {
                .orders-cards-mobile { display: none !important; }
              }
            `}</style>

            <div className="orders-table-desktop admin-table-wrap">
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table" style={{ minWidth: 760 }}>
                  <thead>
                    <tr>
                      {["ID Pedido", "Cliente", "Ciudad", "Total", "Método Pago", "Estado", "Acciones"].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(o => {
                      const st = ORDER_STATUS[o.status] || {};
                      return (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700, fontFamily: "monospace", color: A.goldDark, fontSize: 12 }}>
                            {o.id}
                          </td>
                          <td style={{ fontWeight: 600 }}>{o.customer_name}</td>
                          <td style={{ color: A.textSecondary }}>{o.city || "—"}</td>
                          <td style={{ fontWeight: 700 }}>${(o.total || 0).toLocaleString("es-CO")}</td>
                          <td style={{ color: A.textSecondary }}>{o.payment_method}</td>
                          <td>
                            <select
                              value={o.status}
                              onChange={e => onStatusChange(o.id, e.target.value)}
                              style={{
                                border: `1px solid ${st.color}50`, color: st.color,
                                background: st.bg, padding: "6px 10px", borderRadius: 8,
                                fontSize: 12, fontWeight: 600, cursor: "pointer",
                                outline: "none", fontFamily: "'Jost', sans-serif",
                              }}
                            >
                              <option value="Pendiente" style={{ color: A.textPrimary, background: "#FFF" }}>🕐 Pendiente</option>
                              <option value="Enviado"   style={{ color: A.textPrimary, background: "#FFF" }}>🚚 Enviado</option>
                              <option value="Completado" style={{ color: A.textPrimary, background: "#FFF" }}>✅ Completado</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="admin-btn-secondary"
                                style={{ fontSize: 12, padding: "6px 12px" }}
                              >
                                Ver Detalle
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(o)}
                                className="admin-btn-danger"
                                style={{ padding: "6px 10px", fontSize: 13, borderRadius: 8, lineHeight: 1 }}
                                title="Eliminar pedido"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Móvil: cards ── */}
            <div className="orders-cards-mobile admin-stagger" style={{ flexDirection: "column", gap: 12 }}>
              {filtered.map(o => (
                <OrderCard
                  key={o.id}
                  o={o}
                  onViewDetail={setSelectedOrder}
                  onStatusChange={onStatusChange}
                  onDelete={handleDeleteOrder}
                />
              ))}
            </div>
          </>
        )}

        {/* Contador */}
        {!loadingOrders && filtered.length > 0 && (
          <p style={{ fontSize: 12, color: A.textMuted, textAlign: "right" }}>
            Mostrando <strong>{filtered.length}</strong> de <strong>{orders.length}</strong> pedidos
          </p>
        )}
      </div>

      {/* ── Modal de detalle ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, s) => {
            onStatusChange(id, s);
            setSelectedOrder(prev => ({ ...prev, status: s }));
          }}
          onDelete={id => {
            onDeleteOrder(id);
            setSelectedOrder(null);
          }}
          showConfirm={showConfirm}
        />
      )}
    </>
  );
}
