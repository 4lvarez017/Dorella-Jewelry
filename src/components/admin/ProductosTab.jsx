import { useState, useEffect } from "react";
import { A, CATEGORIES_LIST } from "./AdminTheme";
import { ProductFormModal } from "./ProductFormModal";

// ─── Product Card ────────────────────────────────────────────────────────────
function ProductCard({ p, onEdit, onDelete, onToggleVisibility, onUpdatePrice }) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceVal, setPriceVal] = useState(p.price);

  const isOut = (p.stock ?? 0) === 0;
  const isLow = !isOut && (p.stock ?? 0) < 5;
  const stockColor  = isOut ? A.danger  : isLow ? A.warning  : A.success;
  const stockBg     = isOut ? A.dangerBg : isLow ? A.warningBg : A.successBg;
  const stockLabel  = isOut ? "Sin stock" : `${p.stock ?? 0} uds`;
  const stockIcon   = isOut ? "⛔" : isLow ? "⚠️" : "✅";

  const handlePriceSave = () => {
    const n = Number(priceVal);
    if (!isNaN(n) && n >= 0) onUpdatePrice(p.id, n);
    setEditingPrice(false);
  };

  return (
    <div className="prod-card">
      {/* ── Imagen ── */}
      <div className="prod-card-img-wrap">
        <img
          src={p.image || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80"}
          alt={p.name}
          className="prod-card-img"
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80"; }}
        />

        {/* Visibilidad — esquina superior derecha */}
        <button
          onClick={() => onToggleVisibility(p.id)}
          style={{
            position: "absolute", top: 9, right: 9,
            background: p.visible !== false
              ? "rgba(46,125,50,0.88)"
              : "rgba(30,30,30,0.72)",
            color: "#fff", border: "none", borderRadius: 20,
            padding: "4px 10px", fontSize: 11, fontWeight: 700,
            cursor: "pointer", backdropFilter: "blur(6px)",
            transition: "all 0.2s", letterSpacing: "0.3px",
          }}
        >
          {p.visible !== false ? "👁 Visible" : "🙈 Oculto"}
        </button>

        {/* Categoría — esquina superior izquierda */}
        <div style={{
          position: "absolute", top: 9, left: 9,
          background: "rgba(201,168,76,0.90)",
          color: "#fff", borderRadius: 20,
          padding: "3px 9px", fontSize: 10, fontWeight: 700,
          backdropFilter: "blur(6px)", letterSpacing: "0.4px",
          maxWidth: "calc(100% - 90px)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {p.category}
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div className="prod-card-body">
        {/* Nombre + desc */}
        <div>
          <p style={{
            fontWeight: 700, fontSize: 14, color: A.textPrimary,
            lineHeight: 1.35, marginBottom: 3,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {p.name}
          </p>
          <p style={{
            fontSize: 11, color: A.textMuted, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {p.desc || "Sin descripción"}
          </p>
        </div>

        {/* Precio editable inline */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          {editingPrice ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
              <span style={{ fontSize: 14, color: A.textSecondary, fontWeight: 700 }}>$</span>
              <input
                type="number" min="0"
                value={priceVal}
                onChange={e => setPriceVal(e.target.value)}
                onBlur={handlePriceSave}
                onKeyDown={e => { if (e.key === "Enter") handlePriceSave(); if (e.key === "Escape") setEditingPrice(false); }}
                autoFocus
                className="admin-input"
                style={{ flex: 1, padding: "6px 8px", fontSize: 13 }}
              />
            </div>
          ) : (
            <button
              onClick={() => { setPriceVal(p.price); setEditingPrice(true); }}
              title="Clic para editar precio"
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 8px", borderRadius: 8, marginLeft: -8,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = A.goldBg}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <span style={{ fontSize: 17, fontWeight: 700, color: A.goldDark, fontFamily: "'Jost', sans-serif" }}>
                ${(p.price ?? 0).toLocaleString("es-CO")}
              </span>
              <span style={{ fontSize: 11, color: A.textMuted, opacity: 0.7 }}>✏️</span>
            </button>
          )}
        </div>

        {/* Stock badge */}
        <span className="status-badge" style={{
          background: stockBg, color: stockColor,
          alignSelf: "flex-start", fontSize: 11, paddingLeft: 8,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: stockColor, display: "inline-block", flexShrink: 0 }} />
          {stockIcon} {stockLabel}
        </span>

        {/* Acciones */}
        <div style={{
          display: "flex", gap: 8, marginTop: "auto",
          paddingTop: 10, borderTop: `1px solid ${A.border}`,
        }}>
          <button
            className="admin-btn-secondary"
            style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8 }}
            onClick={() => onEdit(p)}
          >
            ✏️ Editar
          </button>
          <button
            className="admin-btn-danger"
            style={{ padding: "8px 12px", fontSize: 16, borderRadius: 8, lineHeight: 1 }}
            onClick={() => onDelete(p)}
            title="Eliminar producto"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Principal ────────────────────────────────────────────────────────────
export function ProductosTab({
  products, updateProduct, deleteProduct,
  toggleVisibility, addProduct, getCategoryStats,
  onAddProductMobileRef, addToast, showConfirm,
}) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Exponer acción de abrir modal al header móvil
  useEffect(() => {
    if (onAddProductMobileRef) {
      onAddProductMobileRef.current = () => { setEditingProduct(null); setShowModal(true); };
    }
  }, [onAddProductMobileRef]);

  // ── Filtrado y ordenamiento ──
  const filtered = products
    .filter(p => {
      const matchCat =
        selectedCategory === "Todos" ||
        (p.category || "").trim().toLowerCase() === selectedCategory.trim().toLowerCase();
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.desc || "").toLowerCase().includes(q);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (selectedCategory === "Todos" && !search.trim()) {
        const catA = (a.category || "").trim();
        const catB = (b.category || "").trim();
        const catComp = catA.localeCompare(catB, "es", { sensitivity: "base" });
        if (catComp !== 0) return catComp;
      }
      return (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" });
    });

  // ── Handlers ──
  const handleSave = async (data) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        addToast?.("Producto actualizado ✓");
      } else {
        await addProduct(data);
        addToast?.("Producto registrado ✓");
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (e) {
      console.error("Error al guardar producto:", e);
      addToast?.("Error al guardar: " + (e.message || "intenta de nuevo"), "error");
      // Modal permanece abierto para que el usuario pueda reintentar
    }
  };

  const handleDelete = (p) => {
    if (showConfirm) {
      showConfirm(`¿Eliminar "${p.name}" permanentemente? Esta acción no se puede deshacer.`, async () => {
        try {
          await deleteProduct(p.id);
          addToast?.("Producto eliminado", "error");
        } catch (e) {
          console.error("Error al eliminar producto:", e);
          addToast?.("Error al eliminar: " + (e.message || "intenta de nuevo"), "error");
        }
      });
    } else {
      if (confirm(`¿Eliminar "${p.name}"?`)) {
        deleteProduct(p.id).catch(e => {
          addToast?.("Error al eliminar: " + (e.message || "intenta de nuevo"), "error");
        });
      }
    }
  };

  const handleToggleVisibility = async (id) => {
    const prod = products.find(x => String(x.id) === String(id));
    try {
      await toggleVisibility(id);
      addToast?.(
        prod?.visible !== false ? "Producto ocultado" : "Producto visible ✓",
        "info"
      );
    } catch (e) {
      console.error("Error al cambiar visibilidad:", e);
      addToast?.("Error al cambiar visibilidad", "error");
    }
  };

  const handleUpdatePrice = async (id, price) => {
    try {
      await updateProduct(id, { price });
      addToast?.("Precio actualizado ✓");
    } catch (e) {
      console.error("Error al actualizar precio:", e);
      addToast?.("Error al actualizar precio", "error");
    }
  };

  // Chips de categoría — "Todos" + todas las cats
  const allCats = ["Todos", ...CATEGORIES_LIST.map(c => c.name)];

  return (
    <>
      <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Panel de controles ── */}
        <div style={{
          background: A.cardBg, border: `1px solid ${A.border}`,
          borderRadius: 14, padding: "18px 20px",
          boxShadow: A.shadowSm, display: "flex", flexDirection: "column", gap: 14,
        }}>
          {/* Fila 1: buscador + botón nuevo */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16, color: A.textMuted, pointerEvents: "none",
              }}>🔍</span>
              <input
                className="admin-input"
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
            <button
              className="admin-btn-primary"
              onClick={() => { setEditingProduct(null); setShowModal(true); }}
              style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
              <span>Nuevo Producto</span>
            </button>
          </div>

          {/* Fila 2: chips de categoría */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allCats.map(cat => {
              const catObj = CATEGORIES_LIST.find(c => c.name === cat);
              const stats  = cat !== "Todos" ? getCategoryStats(cat) : null;
              return (
                <button
                  key={cat}
                  className={`filter-chip${selectedCategory === cat ? " active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {catObj?.icon ? `${catObj.icon} ` : ""}{cat}
                  {stats && stats.count > 0 && (
                    <span style={{
                      marginLeft: 5, fontSize: 10, fontWeight: 700,
                      background: selectedCategory === cat ? `${A.gold}30` : A.bg,
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

        {/* ── Contador de resultados ── */}
        {products.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: A.textMuted }}>
              <span style={{ fontWeight: 600, color: A.textSecondary }}>{filtered.length}</span>{" "}
              {filtered.length === 1 ? "producto" : "productos"}
              {selectedCategory !== "Todos" && (
                <> · <span style={{ color: A.goldDark, fontWeight: 600 }}>{selectedCategory}</span></>
              )}
              {search && <> · "{search}"</>}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", fontSize: 12, color: A.textMuted, cursor: "pointer", textDecoration: "underline" }}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {/* ── Grilla de productos ── */}
        {products.length === 0 ? (
          /* Estado: sin productos en absoluto */
          <div style={{
            background: A.cardBg, border: `1px solid ${A.border}`,
            borderRadius: 16, padding: "70px 24px", textAlign: "center",
            boxShadow: A.shadowSm,
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✨</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: A.textPrimary, marginBottom: 8 }}>
              Sin productos aún
            </p>
            <p style={{ fontSize: 13, color: A.textMuted, marginBottom: 28 }}>
              Agrega tu primer producto para comenzar a gestionar tu catálogo.
            </p>
            <button
              className="admin-btn-primary"
              onClick={() => { setEditingProduct(null); setShowModal(true); }}
            >
              + Agregar Primer Producto
            </button>
          </div>
        ) : filtered.length === 0 ? (
          /* Estado: sin resultados para búsqueda/filtro actual */
          <div style={{
            background: A.cardBg, border: `1px solid ${A.border}`,
            borderRadius: 16, padding: "60px 24px", textAlign: "center",
            boxShadow: A.shadowSm,
          }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: A.textPrimary, marginBottom: 8 }}>
              Sin resultados
            </p>
            <p style={{ fontSize: 13, color: A.textMuted, marginBottom: 24 }}>
              No encontramos productos con ese criterio. Intenta otra búsqueda o categoría.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {search && (
                <button className="admin-btn-secondary" onClick={() => setSearch("")}>
                  Limpiar búsqueda
                </button>
              )}
              {selectedCategory !== "Todos" && (
                <button className="admin-btn-secondary" onClick={() => setSelectedCategory("Todos")}>
                  Ver todos
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="prod-card-grid admin-stagger">
            {filtered.map(p => (
              <ProductCard
                key={`${p.id}-${p.category}`}
                p={p}
                onEdit={prod => { setEditingProduct(prod); setShowModal(true); }}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
                onUpdatePrice={handleUpdatePrice}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de producto ── */}
      {showModal && (
        <ProductFormModal
          product={editingProduct}
          defaultCategory={selectedCategory !== "Todos" ? selectedCategory : null}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
