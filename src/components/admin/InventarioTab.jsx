import { useState } from "react";
import { A, CATEGORIES_LIST } from "./AdminTheme";

function CategoryGrid({ categories, onSelect, getCategoryStats }) {
  return (
    <div className="admin-section-in">
      <p style={{ fontSize: 13, color: A.textMuted, marginBottom: 16 }}>
        Selecciona una categoría para controlar y editar el stock de existencias.
      </p>
      <div className="admin-grid-cat">
        {categories.map((cat) => {
          const stats = getCategoryStats(cat.name);
          return (
            <div
              key={cat.name}
              className="admin-cat-card"
              onClick={() => onSelect(cat.name)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: A.textPrimary, marginBottom: 8 }}>
                {cat.name}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
                <span style={{ color: A.textSecondary }}>
                  Artículos: <strong style={{ color: A.textPrimary }}>{stats.count}</strong>
                </span>
                <span style={{ color: A.textSecondary }}>
                  Stock: <strong style={{ color: A.textPrimary }}>{stats.stock} uds</strong>
                </span>
                {stats.lowStock > 0 && (
                  <span style={{ color: A.warning, fontWeight: 600, fontSize: 11 }}>
                    ⚠️ {stats.lowStock} con stock bajo
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InventarioTab({ products, updateProduct, deleteProduct, getCategoryStats }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    if (!selectedCategory) return true;
    if (!(p.category || "").startsWith(selectedCategory)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.desc || "").toLowerCase().includes(q)
    );
  });

  if (!selectedCategory) {
    return (
      <CategoryGrid
        categories={CATEGORIES_LIST}
        onSelect={setSelectedCategory}
        getCategoryStats={getCategoryStats}
      />
    );
  }

  return (
    <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Breadcrumb + Volver */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => { setSelectedCategory(null); setSearch(""); }}
          className="admin-btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Volver
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: A.textMuted }}>
          <span>Inventario</span>
          <span>›</span>
          <strong style={{ color: A.textPrimary }}>{selectedCategory}</strong>
        </div>
      </div>

      {/* Tabla de stock */}
      <div className="admin-table-wrap">
        {/* Search bar */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${A.border}` }}>
          <input
            className="admin-input"
            type="text"
            placeholder={`Buscar en ${selectedCategory}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-table admin-table-responsive">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th style={{ textAlign: "center" }}>Ajustar Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: 40, color: A.textMuted }}>
                    No hay productos en esta categoría.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isOut = p.stock === 0;
                  const isLow = !isOut && p.stock < 5;
                  const statusColor = isOut ? A.danger : isLow ? A.warning : A.success;
                  const statusBg    = isOut ? A.dangerBg : isLow ? A.warningBg : A.successBg;

                  return (
                    <tr key={p.id}>
                      <td data-label="Producto">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: 44, height: 44, objectFit: "cover",
                              borderRadius: 8, border: `1px solid ${A.border}`,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, display: "block", fontSize: 14 }}>{p.name}</span>
                            <span style={{ fontSize: 11, color: A.textMuted }}>ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Stock">
                        <span
                          className="status-badge"
                          style={{ background: statusBg, color: statusColor }}
                        >
                          {isOut ? "⛔ Sin stock" : isLow ? `⚠️ ${p.stock} uds` : `✅ ${p.stock} uds`}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <button
                            className="admin-btn-icon"
                            onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })}
                          >−</button>
                          <input
                            type="number"
                            className="admin-stock-input"
                            min="0"
                            value={p.stock}
                            onChange={(e) => updateProduct(p.id, { stock: Math.max(0, Number(e.target.value)) })}
                          />
                          <button
                            className="admin-btn-icon"
                            onClick={() => updateProduct(p.id, { stock: p.stock + 1 })}
                          >+</button>
                          <button
                            className="admin-btn-danger"
                            onClick={() => {
                              if (confirm(`¿Eliminar "${p.name}" del inventario?`)) deleteProduct(p.id);
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
