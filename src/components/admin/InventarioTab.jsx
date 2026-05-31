import { useState } from "react";
import { A, CATEGORIES_LIST } from "./AdminTheme";

// ─── Stock Card horizontal ────────────────────────────────────────────────────
function StockCard({ p, onUpdate, onDelete, showConfirm, addToast }) {
  const MAX_REF = 30; // referencia visual para la barra
  const stock = p.stock ?? 0;
  const pct = Math.min(100, Math.round((stock / MAX_REF) * 100));
  const isOut = stock === 0;
  const isLow = !isOut && stock < 5;
  const isOk = !isOut && !isLow;

  const statusColor = isOut ? A.danger : isLow ? A.warning : A.success;
  const statusBg = isOut ? A.dangerBg : isLow ? A.warningBg : A.successBg;
  const statusIcon = isOut ? "⛔" : isLow ? "⚠️" : "✅";
  const statusLabel = isOut ? "Sin stock" : isLow ? "Stock bajo" : "En stock";

  const barColor = isOut
    ? A.danger
    : isLow
      ? A.warning
      : `linear-gradient(90deg, ${A.gold}, ${A.goldLight})`;

  const handleDelete = () => {
    if (showConfirm) {
      showConfirm(`¿Eliminar "${p.name}" del inventario?`, () => {
        onDelete(p.id);
        addToast?.("Producto eliminado del inventario", "error");
      });
    } else if (confirm(`¿Eliminar "${p.name}"?`)) {
      onDelete(p.id);
    }
  };

  return (
    <div
      style={{
        background: A.cardBg, border: `1px solid ${A.border}`,
        borderRadius: 12, padding: "14px 18px",
        boxShadow: A.shadowSm,
        display: "flex", alignItems: "center", gap: 14,
        transition: "box-shadow 0.22s, transform 0.22s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = A.shadowMd;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = A.shadowSm;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Miniatura */}
      <img
        src={p.image || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&q=80"}
        alt={p.name}
        onError={e => { e.target.src = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&q=80"; }}
        style={{
          width: 54, height: 54, objectFit: "cover",
          borderRadius: 9, border: `1px solid ${A.border}`, flexShrink: 0,
        }}
      />

      {/* Info + barra */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontWeight: 600, fontSize: 14, color: A.textPrimary,
              marginBottom: 3, whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {p.name}
            </p>
            <span className="status-badge" style={{ background: statusBg, color: statusColor, fontSize: 11 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
              {statusIcon} {statusLabel}
            </span>
          </div>
          <span style={{
            fontSize: 22, fontWeight: 800, color: statusColor,
            flexShrink: 0, fontFamily: "'Jost', sans-serif",
          }}>
            {stock}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="stock-bar-track">
          <div
            className="stock-bar-fill"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      </div>

      {/* Controles de stock */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <button
          className="admin-btn-icon"
          onClick={() => onUpdate(p.id, { stock: Math.max(0, stock - 1) })}
          title="Reducir stock"
        >
          −
        </button>
        <input
          type="number" min="0"
          value={stock}
          onChange={e => onUpdate(p.id, { stock: Math.max(0, Number(e.target.value)) })}
          className="admin-stock-input"
        />
        <button
          className="admin-btn-icon"
          onClick={() => onUpdate(p.id, { stock: stock + 1 })}
          title="Aumentar stock"
        >
          +
        </button>
        <button
          className="admin-btn-danger"
          style={{ padding: "7px 10px", fontSize: 15, borderRadius: 8 }}
          onClick={handleDelete}
          title="Eliminar producto"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

// ─── Tab Principal ────────────────────────────────────────────────────────────
export function InventarioTab({ products, updateProduct, deleteProduct, getCategoryStats, addToast, showConfirm }) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === "Todos" || (p.category || "").startsWith(selectedCategory);
    const q = search.trim().toLowerCase();
    const matchSearch = !q || (p.name || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // ── KPIs del filtro actual ──
  const totalStock = filtered.reduce((s, p) => s + (p.stock ?? 0), 0);
  const lowStockCount = filtered.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 5).length;
  const outCount = filtered.filter(p => (p.stock ?? 0) === 0).length;

  const allCats = ["Todos", ...CATEGORIES_LIST.map(c => c.name)];

  return (
    <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── KPI resumen ── */}
      <div className="admin-grid-3">
        {[
          { label: "Unidades totales", value: totalStock, icon: "📦", color: A.goldDark },
          { label: "Stock bajo (< 5)", value: lowStockCount, icon: "⚠️", color: lowStockCount > 0 ? A.warning : A.success },
          { label: "Sin stock", value: outCount, icon: "⛔", color: outCount > 0 ? A.danger : A.success },
        ].map(item => (
          <div key={item.label} className="admin-metric-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: A.textSecondary, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {item.label}
              </span>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
            </div>
            <span style={{ fontSize: 30, fontWeight: 800, color: item.color, fontFamily: "'Jost', sans-serif" }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Controles: búsqueda + filtros ── */}
      <div style={{
        background: A.cardBg, border: `1px solid ${A.border}`,
        borderRadius: 14, padding: "16px 18px",
        boxShadow: A.shadowSm, display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)",
            fontSize: 16, color: A.textMuted, pointerEvents: "none",
          }}>🔍</span>
          <input
            className="admin-input"
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Chips de categoría con alertas */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {allCats.map(cat => {
            const catObj = CATEGORIES_LIST.find(c => c.name === cat);
            const stats = cat !== "Todos" ? getCategoryStats(cat) : null;
            const hasAlert = stats && stats.lowStock > 0;
            return (
              <button
                key={cat}
                className={`filter-chip${selectedCategory === cat ? " active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ position: "relative" }}
              >
                {catObj?.icon ? `${catObj.icon} ` : ""}{cat}
                {hasAlert && (
                  <span style={{
                    marginLeft: 5, fontSize: 10, fontWeight: 700,
                    background: A.dangerBg, color: A.danger,
                    borderRadius: 10, padding: "1px 5px",
                  }}>
                    {stats.lowStock}
                  </span>
                )}
                {stats && stats.count > 0 && !hasAlert && (
                  <span style={{
                    marginLeft: 5, fontSize: 10, fontWeight: 700,
                    background: selectedCategory === cat ? `${A.gold}25` : A.bg,
                    color: selectedCategory === cat ? A.goldDark : A.textMuted,
                    borderRadius: 10, padding: "1px 6px",
                  }}>
                    {stats.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contador ── */}
      {filtered.length > 0 && (
        <p style={{ fontSize: 12, color: A.textMuted }}>
          <span style={{ fontWeight: 600, color: A.textSecondary }}>{filtered.length}</span>{" "}
          {filtered.length === 1 ? "producto" : "productos"} ·{" "}
          <span style={{ fontWeight: 600, color: A.textSecondary }}>{totalStock}</span> unidades totales
        </p>
      )}

      {/* ── Lista de cards de stock ── */}
      {filtered.length === 0 ? (
        <div style={{
          background: A.cardBg, border: `1px solid ${A.border}`,
          borderRadius: 14, padding: "56px 24px",
          textAlign: "center", color: A.textMuted, boxShadow: A.shadowSm,
        }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>📦</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 6 }}>
            Sin productos
          </p>
          <p style={{ fontSize: 13 }}>
            {search ? "No encontramos productos con esa búsqueda." : "Esta categoría no tiene productos aún."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="admin-stagger">
          {filtered.map(p => (
            <StockCard
              key={p.id}
              p={p}
              onUpdate={updateProduct}
              onDelete={deleteProduct}
              showConfirm={showConfirm}
              addToast={addToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}
