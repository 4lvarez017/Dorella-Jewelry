import { A, ORDER_STATUS } from "./AdminTheme";
import { OrderDetailModal } from "./OrderDetailModal";
import { useState } from "react";

const FILTERS = ["Todos", "Pendiente", "Enviado", "Completado"];

function OrderCard({ o, onViewDetail, onStatusChange }) {
  const st = ORDER_STATUS[o.status] || {};
  return (
    <div style={{
      background: A.cardBg, border: `1px solid ${A.border}`,
      borderRadius: 12, padding: "16px 18px",
      boxShadow: A.shadowSm,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 13, color: A.goldDark, fontFamily: "monospace" }}>
            {o.id}
          </span>
          <div style={{ fontWeight: 600, fontSize: 15, color: A.textPrimary, marginTop: 2 }}>
            {o.customer_name}
          </div>
          <div style={{ fontSize: 12, color: A.textMuted, marginTop: 2 }}>
            {o.city || "N/A"} · {o.payment_method}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: A.textPrimary }}>
            ${(o.total || 0).toLocaleString("es-CO")}
          </div>
          <span className="status-badge" style={{ background: st.bg, color: st.color, marginTop: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color, display: "inline-block" }} />
            {o.status}
          </span>
        </div>
      </div>

      {/* Actions row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select
          value={o.status}
          onChange={(e) => onStatusChange(o.id, e.target.value)}
          style={{
            flex: 1, padding: "8px 12px",
            border: `1px solid ${st.color}50`,
            borderRadius: 8, fontSize: 12,
            fontWeight: 600, cursor: "pointer",
            color: st.color,
            background: st.bg,
            fontFamily: "'Jost', sans-serif",
            outline: "none",
          }}
        >
          <option value="Pendiente" style={{ color: A.textPrimary, background: "#FFF" }}>Pendiente</option>
          <option value="Enviado"   style={{ color: A.textPrimary, background: "#FFF" }}>Enviado</option>
          <option value="Completado" style={{ color: A.textPrimary, background: "#FFF" }}>Completado</option>
        </select>
        <button
          onClick={() => onViewDetail(o)}
          className="admin-btn-secondary"
          style={{ fontSize: 12, padding: "8px 16px" }}
        >
          Ver Detalle
        </button>
      </div>
    </div>
  );
}

export function PedidosTab({ orders, loadingOrders, supabaseAvailable, onStatusChange, onRefresh, onExportCSV }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "Todos" || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.id || "").toLowerCase().includes(q) ||
      (o.city || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <>
      <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Banner offline */}
        {!supabaseAvailable && (
          <div style={{
            background: "#FFF8E7",
            border: "1px solid #FFB300",
            borderRadius: 12, padding: "14px 18px",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 700, color: "#7A5800", fontSize: 13, marginBottom: 4 }}>
                Sin conexión a Supabase — Mostrando pedidos locales
              </p>
              <p style={{ color: "#7A5800", fontSize: 12, lineHeight: 1.6 }}>
                Los pedidos están guardados en este dispositivo. Para sincronizarlos con la nube,
                ve a <strong>supabase.com → SQL Editor</strong> y ejecuta el archivo <code>supabase_orders_rls.sql</code>.
              </p>
            </div>
          </div>
        )}

        {/* Controles */}
        <div style={{
          background: A.cardBg, border: `1px solid ${A.border}`,
          borderRadius: 12, padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 14,
          boxShadow: A.shadowSm,
        }}>
          {/* Filtros */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-chip${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
                {f !== "Todos" && (
                  <span style={{
                    marginLeft: 5, fontSize: 11, fontWeight: 700,
                    background: filter === f ? `${A.gold}25` : A.bg,
                    color: filter === f ? A.goldDark : A.textMuted,
                    borderRadius: 10, padding: "1px 6px",
                  }}>
                    {orders.filter((o) => o.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Búsqueda + Exportar */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="admin-input"
              type="text"
              placeholder="Buscar por cliente, ID o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 180 }}
            />
            <button className="admin-btn-secondary" onClick={onRefresh} style={{ whiteSpace: "nowrap" }}>
              🔄 Actualizar
            </button>
            <button className="admin-btn-secondary" onClick={onExportCSV} style={{ whiteSpace: "nowrap" }}>
              📥 Exportar CSV
            </button>
          </div>
        </div>

        {/* Contenido */}
        {loadingOrders ? (
          <div style={{
            background: A.cardBg, border: `1px solid ${A.border}`,
            borderRadius: 12, padding: "60px 20px",
            textAlign: "center", color: A.textMuted,
            boxShadow: A.shadowSm,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            <p style={{ fontSize: 14 }}>Cargando pedidos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: A.cardBg, border: `1px solid ${A.border}`,
            borderRadius: 12, padding: "60px 20px",
            textAlign: "center", color: A.textMuted,
            boxShadow: A.shadowSm,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14 }}>No se encontraron pedidos con los filtros aplicados.</p>
          </div>
        ) : (
          <>
            {/* Vista Móvil: cards (ocultar tabla en móvil, mostrar cards) */}
            <style>{`
              @media (max-width: 640px) {
                .orders-table-desktop { display: none !important; }
                .orders-cards-mobile  { display: flex !important; }
              }
              @media (min-width: 641px) {
                .orders-cards-mobile  { display: none !important; }
              }
            `}</style>
            <div className="orders-table-desktop admin-table-wrap" style={{ display: "block" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table" style={{ minWidth: 780 }}>
                  <thead>
                    <tr>
                      {["ID Pedido", "Cliente", "Ciudad", "Total", "Método Pago", "Estado", "Acciones"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => {
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
                              onChange={(e) => onStatusChange(o.id, e.target.value)}
                              style={{
                                border: `1px solid ${st.color}50`,
                                color: st.color,
                                background: st.bg,
                                padding: "6px 10px",
                                borderRadius: 6,
                                fontSize: 12, fontWeight: 600,
                                cursor: "pointer",
                                outline: "none",
                                fontFamily: "'Jost', sans-serif",
                              }}
                            >
                              <option value="Pendiente" style={{ color: A.textPrimary, background: "#FFF" }}>Pendiente</option>
                              <option value="Enviado"   style={{ color: A.textPrimary, background: "#FFF" }}>Enviado</option>
                              <option value="Completado" style={{ color: A.textPrimary, background: "#FFF" }}>Completado</option>
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="admin-btn-secondary"
                              style={{ fontSize: 12, padding: "6px 14px" }}
                            >
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div
              className="orders-cards-mobile"
              style={{ flexDirection: "column", gap: 12 }}
            >
              {filtered.map((o) => (
                <OrderCard
                  key={o.id}
                  o={o}
                  onViewDetail={setSelectedOrder}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </>
        )}

        {/* Contador */}
        {!loadingOrders && filtered.length > 0 && (
          <p style={{ fontSize: 12, color: A.textMuted, textAlign: "right" }}>
            Mostrando {filtered.length} de {orders.length} pedidos
          </p>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}
