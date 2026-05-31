import { A } from "./AdminTheme";

// ─── Tarjeta de métrica principal ─────────────────────────────────────────────
function MetricCard({ label, value, icon, highlight }) {
  return (
    <div className="admin-metric-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: A.textSecondary, textTransform: "uppercase", letterSpacing: "1px" }}>
          {label}
        </p>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${A.gold}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>{icon}</span>
      </div>
      <p style={{
        fontSize: 30, fontWeight: 700,
        color: highlight || A.textPrimary,
        lineHeight: 1, fontFamily: "'Jost', sans-serif",
      }}>
        {value}
      </p>
    </div>
  );
}

// ─── Gráfico de barras semanal ─────────────────────────────────────────────────
function WeeklySalesChart({ data }) {
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div style={{
      background: A.cardBg, border: `1px solid ${A.border}`,
      borderRadius: 12, padding: "24px 24px 20px",
      boxShadow: A.shadowSm,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 24 }}>
        📈 Ingresos Semanales
        <span style={{ fontSize: 12, color: A.textMuted, fontWeight: 400, marginLeft: 8 }}>
          (pedidos completados)
        </span>
      </h3>

      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        height: 160, gap: 6,
        borderBottom: `1px solid ${A.border}`,
        padding: "0 4px",
        position: "relative",
      }}>
        {/* Líneas horizontales de referencia */}
        {[25, 50, 75, 100].map((pct) => (
          <div key={pct} style={{
            position: "absolute",
            left: 0, right: 0,
            bottom: `${pct * 1.6}px`,
            borderTop: `1px dashed ${A.border}`,
            pointerEvents: "none",
          }} />
        ))}

        {data.map((day, idx) => {
          const barH = Math.max(8, (day.total / max) * 140);
          return (
            <div
              key={idx}
              className="chart-bar-wrap"
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", cursor: "pointer" }}
            >
              {/* Tooltip */}
              <div
                className="chart-tt"
                style={{
                  position: "absolute",
                  bottom: barH + 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: A.textPrimary,
                  color: "#FFF",
                  padding: "5px 9px",
                  borderRadius: 6,
                  fontSize: 11, fontWeight: 700,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  opacity: 0,
                  transition: "opacity 0.15s",
                  zIndex: 10,
                  boxShadow: A.shadowMd,
                }}
              >
                ${day.total.toLocaleString("es-CO")}
              </div>

              {/* Barra */}
              <div style={{
                width: "100%", maxWidth: 32,
                height: barH,
                background: `linear-gradient(180deg, ${A.goldLight} 0%, ${A.gold} 100%)`,
                borderRadius: "6px 6px 0 0",
                transition: "height 0.8s cubic-bezier(0.16,1,0.3,1)",
              }} />

              {/* Etiqueta día */}
              <span style={{
                fontSize: 10, color: A.textMuted,
                marginTop: 6, textTransform: "capitalize",
                letterSpacing: "0.3px",
              }}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Distribución de métodos de pago ──────────────────────────────────────────
function PaymentMethodsChart({ data }) {
  return (
    <div style={{
      background: A.cardBg, border: `1px solid ${A.border}`,
      borderRadius: 12, padding: "24px",
      boxShadow: A.shadowSm,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 20 }}>
        💳 Métodos de Pago
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.map((item, idx) => (
          <div key={idx}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: A.textPrimary }}>{item.name}</span>
              <span style={{ color: A.textSecondary }}>{item.count} ({item.percentage}%)</span>
            </div>
            <div style={{
              width: "100%", height: 7, background: A.border,
              borderRadius: 4, overflow: "hidden",
            }}>
              <div style={{
                width: `${item.percentage}%`, height: "100%",
                background: `linear-gradient(90deg, ${A.gold}, ${A.goldLight})`,
                borderRadius: 4,
                transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal del Dashboard ───────────────────────────────────────
export function DashboardTab({ orders, products, chartSalesData, paymentStats, topProducts, onGotoPedidos }) {
  // Métricas calculadas
  const completed = orders.filter((o) => o.status === "Completado");
  const revenue   = completed.reduce((s, o) => s + (o.total || 0), 0);
  const pending   = orders.filter((o) => o.status === "Pendiente");
  const avgTicket = completed.length > 0 ? revenue / completed.length : 0;
  const lowStock  = products.filter((p) => (p.stock ?? 0) < 5);

  return (
    <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Métricas Principales ── */}
      <div className="admin-grid-4">
        <MetricCard
          label="Ganancias Totales"
          value={`$${revenue.toLocaleString("es-CO")}`}
          icon="💰"
          highlight={A.goldDark}
        />
        <MetricCard
          label="Pedidos Recibidos"
          value={orders.length}
          icon="🧾"
        />
        <MetricCard
          label="Ticket Promedio"
          value={`$${Math.round(avgTicket).toLocaleString("es-CO")}`}
          icon="📊"
        />
        <MetricCard
          label="Stock Bajo ⚠️"
          value={lowStock.length}
          icon="📦"
          highlight={lowStock.length > 0 ? A.warning : A.success}
        />
      </div>

      {/* ── Gráficos ── */}
      <div className="admin-grid-2">
        <WeeklySalesChart data={chartSalesData} />
        <PaymentMethodsChart data={paymentStats} />
      </div>

      {/* ── Fila inferior ── */}
      <div className="admin-grid-2">
        {/* Top Vendidos */}
        <div style={{
          background: A.cardBg, border: `1px solid ${A.border}`,
          borderRadius: 12, padding: 24, boxShadow: A.shadowSm,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 16 }}>
            🏆 Productos Más Vendidos
          </h3>
          {topProducts.length === 0 ? (
            <p style={{ fontSize: 13, color: A.textMuted }}>
              Sin ventas registradas aún para calcular estadísticas.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {topProducts.map((p, idx) => (
                <div key={idx} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0",
                  borderBottom: idx < topProducts.length - 1 ? `1px solid ${A.border}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: idx === 0 ? `${A.gold}20` : A.bg,
                      color: idx === 0 ? A.goldDark : A.textMuted,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: A.textPrimary }}>{p.name}</span>
                  </div>
                  <span style={{
                    background: `${A.gold}12`,
                    color: A.goldDark,
                    padding: "3px 10px",
                    borderRadius: 20, fontSize: 12, fontWeight: 700,
                  }}>
                    {p.qty} uds
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedidos Pendientes */}
        <div style={{
          background: A.cardBg, border: `1px solid ${A.border}`,
          borderRadius: 12, padding: 24, boxShadow: A.shadowSm,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 16 }}>
            🔔 Pedidos Pendientes
          </h3>
          {pending.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 8, padding: "20px 0",
            }}>
              <span style={{ fontSize: 36 }}>✅</span>
              <p style={{ fontSize: 13, color: A.success, fontWeight: 600, textAlign: "center" }}>
                ¡Al día! No hay pedidos pendientes.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {pending.slice(0, 4).map((o, idx) => (
                <div key={idx} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 0",
                  borderBottom: `1px solid ${A.border}`,
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14, display: "block", color: A.textPrimary }}>
                      {o.customer_name}
                    </span>
                    <span style={{ fontSize: 11, color: A.textMuted }}>
                      {o.id} · {o.city || "Ciudad N/A"}
                    </span>
                  </div>
                  <button
                    onClick={() => onGotoPedidos()}
                    style={{
                      background: A.goldBg, border: `1px solid ${A.gold}50`,
                      color: A.goldDark, padding: "5px 12px",
                      borderRadius: 20, fontSize: 11, fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Gestionar
                  </button>
                </div>
              ))}
              {pending.length > 4 && (
                <button
                  onClick={() => onGotoPedidos()}
                  style={{
                    marginTop: 12, width: "100%", padding: "10px",
                    background: A.goldBg, border: `1px solid ${A.gold}40`,
                    color: A.goldDark, borderRadius: 8, fontSize: 13,
                    fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Ver {pending.length - 4} más →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
