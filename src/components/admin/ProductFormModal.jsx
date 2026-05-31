import { useState, useEffect } from "react";
import { A, CATEGORIES_LIST } from "./AdminTheme";

export function ProductFormModal({ product, defaultCategory, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    category: "Anillos",
    price: "",
    stock: "",
    desc: "",
    image: "",
  });

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
      setForm((f) => ({ ...f, category: defaultCategory }));
    }
  }, [product, defaultCategory]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      alert("Por favor completa los campos obligatorios (*)");
      return;
    }
    const imagesArray = form.image
      ? form.image.split(",").map((u) => u.trim()).filter(Boolean)
      : ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"];

    onSave({
      name:     form.name,
      category: form.category,
      price:    Number(form.price),
      stock:    form.stock !== "" ? Number(form.stock) : 10,
      desc:     form.desc,
      images:   imagesArray,
      image:    imagesArray[0],
    });
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520 }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: `1px solid ${A.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22, fontWeight: 600, color: A.goldDark,
          }}>
            {product ? "✏️ Editar Producto" : "✨ Nuevo Producto"}
          </h3>
          <button onClick={onClose} style={{
            background: "#F0EDE8", border: "none", borderRadius: 8,
            width: 34, height: 34, fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: A.textSecondary,
          }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Nombre */}
            <div>
              <label className="admin-label">Nombre del Producto *</label>
              <input
                className="admin-input"
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Anillo Corona Esmeralda"
              />
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
                  {CATEGORIES_LIST.map((cat) => (
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
                  required
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="185000"
                />
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
              <p style={{ fontSize: 11, color: A.textMuted, marginTop: 6 }}>
                Puedes ingresar varias URLs separadas por comas para el carrusel de fotos.
              </p>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button type="button" onClick={onClose} className="admin-btn-secondary" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button type="submit" className="admin-btn-primary" style={{ flex: 1 }}>
                {product ? "Guardar Cambios" : "Registrar Producto"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
