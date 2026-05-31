import { useState } from "react";
import { A, CATEGORIES_LIST } from "./AdminTheme";
import { ProductFormModal } from "./ProductFormModal";

function CategoryGrid({ categories, onSelect, getCategoryStats }) {
  return (
    <div className="admin-section-in">
      <p style={{ fontSize: 13, color: A.textMuted, marginBottom: 16 }}>
        Selecciona una sección para editar precios, visibilidad y registrar nuevos productos.
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
                  Registrados: <strong style={{ color: A.textPrimary }}>{stats.count}</strong>
                </span>
                <span style={{ color: A.textMuted, fontSize: 11 }}>
                  Toca para gestionar
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProductosTab({ products, updateProduct, deleteProduct, toggleVisibility, addProduct, getCategoryStats, onAddProductMobile }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Para exponer la acción de abrir modal a AdminHeader en móvil
  if (onAddProductMobile) {
    onAddProductMobile.current = () => {
      setEditingProduct(null);
      setShowModal(true);
    };
  }

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

  const handleSave = (data) => {
    if (editingProduct) updateProduct(editingProduct.id, data);
    else addProduct(data);
    setShowModal(false);
    setEditingProduct(null);
  };

  if (!selectedCategory) {
    return (
      <>
        <CategoryGrid
          categories={CATEGORIES_LIST}
          onSelect={setSelectedCategory}
          getCategoryStats={getCategoryStats}
        />
        {showModal && (
          <ProductFormModal
            product={editingProduct}
            defaultCategory={null}
            onClose={() => { setShowModal(false); setEditingProduct(null); }}
            onSave={handleSave}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Breadcrumb + Acciones */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => { setSelectedCategory(null); setSearch(""); }}
              className="admin-btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              ← Volver
            </button>
            <div style={{ fontSize: 13, color: A.textMuted }}>
              Productos › <strong style={{ color: A.textPrimary }}>{selectedCategory}</strong>
            </div>
          </div>

          <button
            className="admin-btn-primary"
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>+</span> Nuevo en {selectedCategory}
          </button>
        </div>

        {/* Tabla de productos */}
        <div className="admin-table-wrap">
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${A.border}` }}>
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
                  <th>Precio (COP)</th>
                  <th>Visibilidad</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 40, color: A.textMuted }}>
                      No hay productos en esta categoría.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      {/* Producto */}
                      <td data-label="Producto">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: 48, height: 48, objectFit: "cover",
                              borderRadius: 8, border: `1px solid ${A.border}`, flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontWeight: 600, display: "block", fontSize: 14, color: A.textPrimary }}>
                              {p.name}
                            </span>
                            <span style={{
                              fontSize: 11, color: A.textMuted,
                              display: "-webkit-box", WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>
                              {p.desc || "Sin descripción"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Precio editable */}
                      <td data-label="Precio">
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontWeight: 700, color: A.textSecondary }}>$</span>
                          <input
                            type="number"
                            min="0"
                            value={p.price}
                            onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) })}
                            className="admin-input"
                            style={{ width: 110, padding: "7px 10px" }}
                          />
                        </div>
                      </td>

                      {/* Visibilidad */}
                      <td data-label="Visibilidad">
                        <button
                          onClick={() => toggleVisibility(p.id)}
                          className={p.visible !== false ? "vis-toggle-on" : "vis-toggle-off"}
                        >
                          {p.visible !== false ? "👁️ Visible" : "🙈 Oculto"}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td data-label="Acciones">
                        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            className="admin-btn-secondary"
                            style={{ padding: "6px 14px", fontSize: 12 }}
                            onClick={() => { setEditingProduct(p); setShowModal(true); }}
                          >
                            Editar
                          </button>
                          <button
                            className="admin-btn-danger"
                            onClick={() => {
                              if (confirm(`¿Eliminar "${p.name}" permanentemente?`)) deleteProduct(p.id);
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          defaultCategory={selectedCategory}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
