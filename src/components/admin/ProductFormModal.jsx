import { useState, useEffect, useRef } from "react";
import { A, CATEGORIES_LIST } from "./AdminTheme";
import { uploadProductImage } from "../../lib/supabase";

// ─── Drag & Drop Image Uploader ───────────────────────────────────────────────
function ImageUploader({ category, images, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    const urls = [...images];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const url = await uploadProductImage(file, category);
        urls.push(url);
      } catch (e) {
        setUploadError("Error al subir: " + (e.message || "intenta de nuevo"));
      }
    }
    onChange(urls);
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Zona de arrastrar / seleccionar */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? A.goldMid : A.border}`,
          borderRadius: 12,
          padding: "24px 20px",
          textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragging ? A.goldBg : A.surfaceBg,
          transition: "all 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28,
              border: `3px solid ${A.border}`,
              borderTopColor: A.goldMid,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <span style={{ fontSize: 13, color: A.textSecondary }}>Subiendo a Supabase...</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 32 }}>📁</span>
            <p style={{ fontSize: 14, color: A.textSecondary, margin: 0 }}>
              <strong style={{ color: A.goldDark }}>Haz clic</strong> o arrastra imágenes aquí
            </p>
            <p style={{ fontSize: 11, color: A.textMuted, margin: 0 }}>
              JPG, PNG, WEBP — múltiples archivos permitidos
            </p>
            <p style={{ fontSize: 11, color: A.goldMid, margin: 0, marginTop: 2 }}>
              📂 Se guardarán en: <code style={{ background: A.goldBg, padding: "1px 6px", borderRadius: 4 }}>
                products/{category.toLowerCase().replace(/ /g, "_")}
              </code>
            </p>
          </div>
        )}
      </div>

      {/* Error de upload */}
      {uploadError && (
        <p style={{ fontSize: 12, color: A.danger, margin: 0 }}>⚠️ {uploadError}</p>
      )}

      {/* Vista previa de imágenes subidas */}
      {images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {images.map((url, idx) => (
            <div key={idx} style={{ position: "relative", width: 80, height: 80 }}>
              <img
                src={url}
                alt={`img-${idx}`}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                  border: idx === 0 ? `2px solid ${A.goldMid}` : `1px solid ${A.border}`,
                }}
              />
              {idx === 0 && (
                <span style={{
                  position: "absolute", bottom: 2, left: 2,
                  fontSize: 9, background: A.goldMid, color: "#fff",
                  borderRadius: 3, padding: "1px 4px", fontWeight: 700,
                }}>PRINCIPAL</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: "absolute", top: -6, right: -6,
                  width: 20, height: 20, borderRadius: "50%",
                  background: A.danger, color: "#fff",
                  border: "none", cursor: "pointer",
                  fontSize: 11, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  lineHeight: 1,
                }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Separador OR */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}>
        <div style={{ flex: 1, height: 1, background: A.border }} />
        <span style={{ fontSize: 11, color: A.textMuted }}>o pega una URL externa</span>
        <div style={{ flex: 1, height: 1, background: A.border }} />
      </div>

      {/* Input URL externa */}
      <input
        className="admin-input"
        type="text"
        placeholder="https://ejemplo.com/imagen.jpg"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const url = e.target.value.trim();
            if (url) { onChange([...images, url]); e.target.value = ""; }
          }
        }}
        onBlur={(e) => {
          const url = e.target.value.trim();
          if (url && !images.includes(url)) { onChange([...images, url]); e.target.value = ""; }
        }}
        style={{ fontSize: 13 }}
      />
      <p style={{ fontSize: 11, color: A.textMuted, margin: "-6px 0 0" }}>
        Presiona Enter o haz clic fuera para agregar la URL. La primera imagen es la principal.
      </p>
    </div>
  );
}

// ─── Modal Principal ──────────────────────────────────────────────────────────
export function ProductFormModal({ product, defaultCategory, onClose, onSave }) {
  const [form, setForm] = useState({
    name:     "",
    category: "Anillos",
    price:    "",
    stock:    "",
    desc:     "",
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Cargar datos del producto a editar
  useEffect(() => {
    if (product) {
      setForm({
        name:     product.name     || "",
        category: product.category || "Anillos",
        price:    product.price    || "",
        stock:    product.stock !== undefined ? product.stock : "",
        desc:     product.desc     || "",
      });
      const imgs = Array.isArray(product.images)
        ? product.images
        : [product.image].filter(Boolean);
      setImages(imgs);
    } else if (defaultCategory) {
      setForm(f => ({ ...f, category: defaultCategory }));
      setImages([]);
    }
    setErrors({});
  }, [product, defaultCategory]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }));
  };

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
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);

    const finalImages = images.length > 0
      ? images
      : ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"];

    await new Promise(r => setTimeout(r, 200));

    onSave({
      name:     form.name.trim(),
      category: form.category,
      price:    Number(form.price),
      stock:    form.stock !== "" ? Number(form.stock) : 10,
      desc:     form.desc.trim(),
      images:   finalImages,
      image:    finalImages[0],
    });

    setSaving(false);
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 580 }}
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

            {/* Uploader de imágenes */}
            <div>
              <label className="admin-label">
                Imágenes del Producto
                {images.length > 0 && (
                  <span style={{
                    marginLeft: 8, fontSize: 11,
                    background: A.goldBg, color: A.goldDark,
                    borderRadius: 10, padding: "2px 8px",
                  }}>
                    {images.length} {images.length === 1 ? "imagen" : "imágenes"}
                  </span>
                )}
              </label>
              <ImageUploader
                category={form.category}
                images={images}
                onChange={setImages}
              />
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
