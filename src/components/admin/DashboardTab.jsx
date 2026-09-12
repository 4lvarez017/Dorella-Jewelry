import { A } from "./AdminTheme";

// ─── Tarjeta de métrica con trend indicator ───────────────────────────────────
function MetricCard({ label, value, icon, highlight, trend }) {
  return (
    <div className="admin-metric-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: A.textSecondary, textTransform: "uppercase", letterSpacing: "1px" }}>
          {label}
        </p>
        <span style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${A.gold}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>
          {icon}
        </span>
      </div>
      <p style={{
        fontSize: 30, fontWeight: 700,
        color: highlight || A.textPrimary,
        lineHeight: 1, fontFamily: "'Jost', sans-serif",
        marginBottom: trend ? 8 : 0,
      }}>
        {value}
      </p>
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span className={trend.direction === "up" ? "trend-up" : trend.direction === "down" ? "trend-down" : "trend-flat"}>
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}
          </span>
          <span style={{ fontSize: 11, color: A.textMuted }}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// ─── Gráfico de barras semanal ────────────────────────────────────────────────
function WeeklySalesChart({ data }) {
  const max = Math.max(...data.map(d => d.total), 1);
  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <div style={{
      background: A.cardBg, border: `1px solid ${A.border}`,
      borderRadius: 14, padding: "24px 24px 20px",
      boxShadow: A.shadowSm,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 3 }}>
            📈 Ingresos Semanales
          </h3>
          <p style={{ fontSize: 12, color: A.textMuted }}>Pedidos completados — últimos 7 días</p>
        </div>
        {total > 0 && (
          <div style={{
            background: A.goldBg, border: `1px solid ${A.gold}40`,
            borderRadius: 8, padding: "6px 12px",
            fontSize: 13, fontWeight: 700, color: A.goldDark,
          }}>
            ${total.toLocaleString("es-CO")}
          </div>
        )}
      </div>

      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        height: 160, gap: 6,
        borderBottom: `1px solid ${A.border}`,
        padding: "0 4px",
        position: "relative",
      }}>
        {/* Grid lines */}
        {[25, 50, 75, 100].map(pct => (
          <div key={pct} style={{
            position: "absolute", left: 0, right: 0,
            bottom: `${pct * 1.6}px`,
            borderTop: `1px dashed ${A.border}`,
            pointerEvents: "none",
          }} />
        ))}

        {data.map((day, idx) => {
          const barH = Math.max(6, (day.total / max) * 140);
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
                  bottom: barH + 10, left: "50%",
                  transform: "translateX(-50%)",
                  background: A.textPrimary, color: "#FFF",
                  padding: "5px 9px", borderRadius: 7,
                  fontSize: 11, fontWeight: 700,
                  pointerEvents: "none", whiteSpace: "nowrap",
                  opacity: 0, transition: "opacity 0.15s",
                  zIndex: 10, boxShadow: A.shadowMd,
                }}
              >
                ${day.total.toLocaleString("es-CO")}
              </div>

              {/* Barra */}
              <div style={{
                width: "100%", maxWidth: 32, height: barH,
                background: day.total > 0
                  ? `linear-gradient(180deg, ${A.goldLight} 0%, ${A.gold} 100%)`
                  : A.border,
                borderRadius: "6px 6px 0 0",
                transition: "height 0.8s cubic-bezier(0.16,1,0.3,1)",
              }} />

              {/* Etiqueta */}
              <span style={{
                fontSize: 10, color: A.textMuted,
                marginTop: 7, textTransform: "capitalize",
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

// ─── Métodos de pago ──────────────────────────────────────────────────────────
function PaymentMethodsChart({ data }) {
  return (
    <div style={{
      background: A.cardBg, border: `1px solid ${A.border}`,
      borderRadius: 14, padding: "24px",
      boxShadow: A.shadowSm,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 4 }}>
        💳 Métodos de Pago
      </h3>
      <p style={{ fontSize: 12, color: A.textMuted, marginBottom: 20 }}>
        Distribución de pedidos por método
      </p>
      {data.length === 0 ? (
        <p style={{ fontSize: 13, color: A.textMuted }}>Sin datos aún.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {data.map((item, idx) => (
            <div key={idx}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: A.textPrimary }}>{item.name}</span>
                <span style={{ color: A.textSecondary, fontWeight: 500 }}>
                  {item.count} pedido{item.count !== 1 ? "s" : ""} ({item.percentage}%)
                </span>
              </div>
              <div style={{ width: "100%", height: 7, background: A.border, borderRadius: 4, overflow: "hidden" }}>
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
      )}
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────
export function DashboardTab({ orders, products, chartSalesData, paymentStats, topProducts, onGotoPedidos }) {
  const completed = orders.filter(o => o.status === "Completado");
  const revenue   = completed.reduce((s, o) => s + (o.total || 0), 0);
  const pending   = orders.filter(o => o.status === "Pendiente");
  const avgTicket = completed.length > 0 ? revenue / completed.length : 0;
  const lowStock  = products.filter(p => (p.stock ?? 0) < 5);

  // ── Trend: comparar ventas de esta semana vs anterior ──
  const thisWeekRevenue = chartSalesData.reduce((s, d) => s + d.total, 0);
  const revenueTrend = thisWeekRevenue > 0
    ? { direction: "up",   label: `$${thisWeekRevenue.toLocaleString("es-CO")} esta semana` }
    : { direction: "flat", label: "Sin ventas esta semana" };

  const pendingTrend = pending.length > 0
    ? { direction: "down", label: `${pending.length} requieren atención` }
    : { direction: "up",   label: "Todo al día ✓" };

  const stockTrend = lowStock.length > 0
    ? { direction: "down", label: `${lowStock.length} productos por reabastecer` }
    : { direction: "up",   label: "Stock saludable" };

  return (
    <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Alerta de pedidos urgentes ── */}
      {pending.length > 0 && (
        <div style={{
          background: A.warningBg,
          border: `1px solid ${A.warning}40`,
          borderRadius: 12, padding: "14px 18px",
          display: "flex", gap: 14, alignItems: "center",
          animation: "adminSectionIn 0.3s ease",
        }}>
          <span style={{ fontSize: 22 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: A.warning, fontSize: 13, marginBottom: 2 }}>
              {pending.length} pedido{pending.length !== 1 ? "s" : ""} pendiente{pending.length !== 1 ? "s" : ""} de atender
            </p>
            <p style={{ color: A.warning, fontSize: 12, opacity: 0.85 }}>
              Revisa y actualiza su estado para mantener al cliente informado.
            </p>
          </div>
          <button
            onClick={onGotoPedidos}
            style={{
              background: A.warning, color: "#fff",
              border: "none", borderRadius: 8,
              padding: "8px 16px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Ver pedidos →
          </button>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="admin-grid-4">
        <MetricCard
          label="Ganancias Totales"
          value={`$${revenue.toLocaleString("es-CO")}`}
          icon="💰" highlight={A.goldDark}
          trend={revenueTrend}
        />
        <MetricCard
          label="Pedidos Recibidos"
          value={orders.length}
          icon="🧾"
          trend={pendingTrend}
        />
        <MetricCard
          label="Ticket Promedio"
          value={`$${Math.round(avgTicket).toLocaleString("es-CO")}`}
          icon="📊"
          trend={completed.length > 0
            ? { direction: "up", label: `Basado en ${completed.length} ventas` }
            : { direction: "flat", label: "Sin ventas completadas" }}
        />
        <MetricCard
          label="Stock Bajo ⚠️"
          value={lowStock.length}
          icon="📦"
          highlight={lowStock.length > 0 ? A.warning : A.success}
          trend={stockTrend}
        />
      </div>

      {/* ── Gráficos ── */}
      <div className="admin-grid-2">
        <WeeklySalesChart data={chartSalesData} />
        <PaymentMethodsChart data={paymentStats} />
      </div>

      {/* ── Bottom row ── */}
      <div className="admin-grid-2">
        {/* Top vendidos */}
        <div style={{
          background: A.cardBg, border: `1px solid ${A.border}`,
          borderRadius: 14, padding: 24, boxShadow: A.shadowSm,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 4 }}>
            🏆 Productos Más Vendidos
          </h3>
          <p style={{ fontSize: 12, color: A.textMuted, marginBottom: 18 }}>
            Por unidades vendidas en pedidos completados
          </p>
          {topProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
              <p style={{ fontSize: 13, color: A.textMuted }}>Sin ventas registradas aún.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {topProducts.map((p, idx) => (
                <div key={idx} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0",
                  borderBottom: idx < topProducts.length - 1 ? `1px solid ${A.border}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: idx === 0 ? `${A.gold}22` : A.bg,
                      color: idx === 0 ? A.goldDark : A.textMuted,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, flexShrink: 0,
                    }}>
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: A.textPrimary }}>{p.name}</span>
                  </div>
                  <span style={{
                    background: `${A.gold}12`, color: A.goldDark,
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  }}>
                    {p.qty} uds
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedidos pendientes */}
        <div style={{
          background: A.cardBg, border: `1px solid ${A.border}`,
          borderRadius: 14, padding: 24, boxShadow: A.shadowSm,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 4 }}>
            🔔 Pedidos Pendientes
          </h3>
          <p style={{ fontSize: 12, color: A.textMuted, marginBottom: 18 }}>
            Requieren cambio de estado
          </p>
          {pending.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 0" }}>
              <span style={{ fontSize: 40 }}>✅</span>
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
                      {o.id} · {o.city || "Ciudad N/A"} · ${(o.total || 0).toLocaleString("es-CO")}
                    </span>
                  </div>
                  <button
                    onClick={onGotoPedidos}
                    style={{
                      background: A.goldBg, border: `1px solid ${A.gold}50`,
                      color: A.goldDark, padding: "6px 14px",
                      borderRadius: 20, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", whiteSpace: "nowrap",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${A.gold}20`}
                    onMouseLeave={e => e.currentTarget.style.background = A.goldBg}
                  >
                    Gestionar →
                  </button>
                </div>
              ))}
              {pending.length > 4 && (
                <button
                  onClick={onGotoPedidos}
                  style={{
                    marginTop: 12, width: "100%", padding: "11px",
                    background: A.goldBg, border: `1px solid ${A.gold}40`,
                    color: A.goldDark, borderRadius: 10, fontSize: 13,
                    fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${A.gold}15`}
                  onMouseLeave={e => e.currentTarget.style.background = A.goldBg}
                >
                  Ver {pending.length - 4} pedido{pending.length - 4 !== 1 ? "s" : ""} más →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
