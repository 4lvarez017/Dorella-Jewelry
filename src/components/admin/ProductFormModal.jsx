import { useState, useEffect } from "react";
import { A, CATEGORIES_LIST } from "./AdminTheme";

export function ProductFormModal({ product, defaultCategory, onClose, onSave }) {
  const [form, setForm] = useState({
    name:     "",
    category: "Anillos",
    price:    "",
    stock:    "",
    desc:     "",
    image:    "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Cargar datos del producto a editar
  useEffect(() => {
    if (product) {
      setForm({
        name:     product.name     || "",
        category: product.category || "Anillos",
        price:    product.price    || "",
        stock:    product.stock !== undefined ? product.stock : "",
        desc:     product.desc     || "",
        image:    Array.isArray(product.images)
          ? product.images.join(", ")
          : (product.image || ""),
      });
    } else if (defaultCategory) {
      setForm(f => ({ ...f, category: defaultCategory }));
    }
    setErrors({});
    setImgError(false);
  }, [product, defaultCategory]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Limpiar error del campo al editar
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }));
    if (name === "image") setImgError(false);
  };

  // Validación inline
  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name  = "El nombre es obligatorio.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = "Ingresa un precio válido mayor o igual a 0.";
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);

    const imagesArray = form.image
      ? form.image.split(",").map(u => u.trim()).filter(Boolean)
      : ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"];

    await new Promise(r => setTimeout(r, 300)); // visual feedback mínimo

    onSave({
      name:     form.name.trim(),
      category: form.category,
      price:    Number(form.price),
      stock:    form.stock !== "" ? Number(form.stock) : 10,
      desc:     form.desc.trim(),
      images:   imagesArray,
      image:    imagesArray[0],
    });

    setSaving(false);
  };

  // Primera URL de imagen válida para el preview
  const previewUrl = form.image
    ? form.image.split(",")[0].trim()
    : null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 560 }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "22px 28px 18px",
          borderBottom: `1px solid ${A.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22, fontWeight: 600, color: A.goldDark,
          }}>
            {product ? "✏️ Editar Producto" : "✨ Nuevo Producto"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "#F0EDE8", border: "none", borderRadius: 8,
              width: 34, height: 34, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: A.textSecondary, flexShrink: 0,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = A.goldBg}
            onMouseLeave={e => e.currentTarget.style.background = "#F0EDE8"}
          >
            ✕
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ padding: "22px 28px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* ── Preview de imagen ── */}
            {previewUrl && (
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div
                  className={`img-preview-box${!imgError ? " has-img" : ""}`}
                  style={{ width: 90, height: 90, flexShrink: 0 }}
                >
                  {!imgError && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      onError={() => setImgError(true)}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: 28, color: A.textMuted }}>🖼</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: A.textMuted, lineHeight: 1.6, paddingTop: 4 }}>
                  <strong style={{ color: A.textSecondary }}>Preview en vivo</strong><br />
                  {imgError
                    ? "⚠️ La URL no carga una imagen válida."
                    : "La primera URL se muestra arriba. Puedes pegar varias separadas por comas."}
                </div>
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="admin-label">Nombre del Producto *</label>
              <input
                className="admin-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Anillo Corona Esmeralda"
                style={errors.name ? { borderColor: A.danger } : {}}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            {/* Categoría + Precio */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="admin-label">Categoría</label>
                <select
                  className="admin-input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{ color: A.textPrimary, background: A.cardBg }}
                >
                  {CATEGORIES_LIST.map(cat => (
                    <option key={cat.name} value={cat.name} style={{ color: A.textPrimary }}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label">Precio (COP) *</label>
                <input
                  className="admin-input"
                  type="number"
                  name="price"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="185000"
                  style={errors.price ? { borderColor: A.danger } : {}}
                />
                {errors.price && <p className="field-error">{errors.price}</p>}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="admin-label">Stock Inicial</label>
              <input
                className="admin-input"
                type="number"
                name="stock"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="Ej. 12"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="admin-label">Descripción</label>
              <textarea
                className="admin-input"
                name="desc"
                rows="3"
                value={form.desc}
                onChange={handleChange}
                placeholder="Materiales, diseño, detalles especiales..."
                style={{ resize: "vertical" }}
              />
            </div>

            {/* URLs de imágenes */}
            <div>
              <label className="admin-label">URLs de Imágenes (separadas por comas)</label>
              <input
                className="admin-input"
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://img1.jpg, https://img2.jpg"
              />
              <p style={{ fontSize: 11, color: A.textMuted, marginTop: 6, lineHeight: 1.5 }}>
                Puedes ingresar varias URLs separadas por comas para el carrusel de fotos. La primera se mostrará como principal.
              </p>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button
                type="button"
                onClick={onClose}
                className="admin-btn-secondary"
                style={{ flex: 1 }}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="admin-btn-primary"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span style={{
                      width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite", display: "inline-block",
                    }} />
                    Guardando...
                  </>
                ) : (
                  product ? "Guardar Cambios" : "Registrar Producto"
                )}
              </button>
            </div>
          </div>
        </form>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
