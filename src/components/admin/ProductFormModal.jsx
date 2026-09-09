import { useState, useEffect, useRef } from "react";
import { A, CATEGORIES_LIST } from "./AdminTheme";
import { uploadProductImage } from "../../lib/supabase";

// ─── Drag & Drop Image Uploader ───────────────────────────────────────────────
function ImageUploader({ category, images, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

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

  const moveImage = (fromIdx, toIdx) => {
    if (fromIdx === toIdx || toIdx < 0 || toIdx >= images.length) return;
    const updated = [...images];
    const [item] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, item);
    onChange(updated);
  };

  const setAsPrimary = (idx) => {
    if (idx === 0) return;
    const updated = [...images];
    const [item] = updated.splice(idx, 1);
    updated.unshift(item);
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Zona de arrastrar / seleccionar archivos */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? A.goldMid : A.border}`,
          borderRadius: 12,
          padding: "20px",
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
            <span style={{ fontSize: 30 }}>📁</span>
            <p style={{ fontSize: 13, color: A.textSecondary, margin: 0 }}>
              <strong style={{ color: A.goldDark }}>Haz clic</strong> o arrastra imágenes aquí
            </p>
            <p style={{ fontSize: 11, color: A.textMuted, margin: 0 }}>
              JPG, PNG, WEBP — múltiples archivos permitidos
            </p>
            <p style={{ fontSize: 11, color: A.goldMid, margin: 0, marginTop: 2 }}>
              📂 Guardar en: <code style={{ background: A.goldBg, padding: "1px 6px", borderRadius: 4 }}>
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

      {/* Galería y reordenación de imágenes */}
      {images.length > 0 && (
        <div style={{
          background: "#FAF8F5",
          border: `1px solid ${A.border}`,
          borderRadius: 12,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}>
          {/* Instrucciones y leyenda */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <span style={{ fontSize: 11, color: A.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
              ⭐ <strong>Imagen #1 = Principal (portada).</strong> Arrastra o usa ◀ ▶ para ordenar.
            </span>
            <span style={{ fontSize: 11, color: A.goldDark, fontWeight: 600 }}>
              {images.length} {images.length === 1 ? "imagen" : "imágenes"}
            </span>
          </div>

          {/* Grid de imágenes interactivas */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))",
            gap: 10,
          }}>
            {images.map((url, idx) => {
              const isMain = idx === 0;
              const isDraggingThis = draggedIdx === idx;
              const isTargeted = dragOverIdx === idx && draggedIdx !== idx;

              return (
                <div
                  key={idx}
                  draggable={!uploading}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", String(idx));
                    setDraggedIdx(idx);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverIdx !== idx) setDragOverIdx(idx);
                  }}
                  onDragLeave={() => {
                    if (dragOverIdx === idx) setDragOverIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromStr = e.dataTransfer.getData("text/plain");
                    const from = draggedIdx !== null ? draggedIdx : Number(fromStr);
                    if (!isNaN(from) && from !== idx) {
                      moveImage(from, idx);
                    }
                    setDraggedIdx(null);
                    setDragOverIdx(null);
                  }}
                  onDragEnd={() => {
                    setDraggedIdx(null);
                    setDragOverIdx(null);
                  }}
                  style={{
                    position: "relative",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: isTargeted
                      ? `2px dashed ${A.gold}`
                      : isMain
                      ? `2px solid ${A.gold}`
                      : `1px solid ${A.borderStrong}`,
                    background: isMain ? "#FFFDF9" : "#FFFFFF",
                    boxShadow: isMain ? A.shadowSm : "none",
                    opacity: isDraggingThis ? 0.4 : 1,
                    transform: isTargeted ? "scale(1.03)" : "scale(1)",
                    transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "grab",
                  }}
                  title="Arrastra para cambiar de posición"
                >
                  {/* Barra superior: Badge de orden + botón eliminar */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 6px",
                    background: isMain ? A.goldBg : "rgba(0,0,0,0.03)",
                    borderBottom: `1px solid ${isMain ? "rgba(201,168,76,0.25)" : A.border}`,
                  }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: isMain ? A.goldDark : A.textSecondary,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}>
                      {isMain ? "⭐ #1" : `#${idx + 1}`}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      title="Eliminar imagen"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "rgba(229,57,53,0.12)",
                        color: A.danger,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                        padding: 0,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = A.danger; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(229,57,53,0.12)"; e.currentTarget.style.color = A.danger; }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Imagen Thumbnail */}
                  <div style={{ width: "100%", height: 86, position: "relative", background: "#F5F3EF" }}>
                    <img
                      src={url}
                      alt={`img-${idx}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        userSelect: "none",
                      }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80";
                      }}
                    />
                  </div>

                  {/* Barra de Controles: Hacer Principal y Flechas ◀ ▶ */}
                  <div style={{
                    padding: "4px 4px 6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    background: isMain ? "#FFFDF9" : "#FFFFFF",
                  }}>
                    {/* Botón / Indicador Principal */}
                    {isMain ? (
                      <div style={{
                        width: "100%",
                        textAlign: "center",
                        background: A.gold,
                        color: "#FFFFFF",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        padding: "3px 0",
                        borderRadius: 4,
                        userSelect: "none",
                      }}>
                        ⭐ PRINCIPAL
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsPrimary(idx);
                        }}
                        title="Hacer esta imagen la principal"
                        style={{
                          width: "100%",
                          background: A.goldBg,
                          border: `1px solid ${A.goldLight}`,
                          color: A.goldDark,
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "3px 0",
                          borderRadius: 4,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 3,
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = A.gold;
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = A.goldBg;
                          e.currentTarget.style.color = A.goldDark;
                        }}
                      >
                        ⭐ Portada
                      </button>
                    )}

                    {/* Botones de desplazamiento ◀ ▶ */}
                    <div style={{ display: "flex", gap: 3 }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, idx - 1);
                        }}
                        title={idx === 0 ? "Ya es la primera imagen" : "Mover hacia la izquierda (antes)"}
                        style={{
                          flex: 1,
                          height: 22,
                          background: idx === 0 ? "transparent" : "#F2EFE9",
                          border: `1px solid ${idx === 0 ? "transparent" : A.border}`,
                          color: idx === 0 ? "#C4BFB6" : A.textPrimary,
                          borderRadius: 4,
                          fontSize: 10,
                          cursor: idx === 0 ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (idx !== 0) e.currentTarget.style.background = A.goldBg;
                        }}
                        onMouseLeave={(e) => {
                          if (idx !== 0) e.currentTarget.style.background = "#F2EFE9";
                        }}
                      >
                        ◀
                      </button>

                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, idx + 1);
                        }}
                        title={idx === images.length - 1 ? "Ya es la última imagen" : "Mover hacia la derecha (después)"}
                        style={{
                          flex: 1,
                          height: 22,
                          background: idx === images.length - 1 ? "transparent" : "#F2EFE9",
                          border: `1px solid ${idx === images.length - 1 ? "transparent" : A.border}`,
                          color: idx === images.length - 1 ? "#C4BFB6" : A.textPrimary,
                          borderRadius: 4,
                          fontSize: 10,
                          cursor: idx === images.length - 1 ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (idx !== images.length - 1) e.currentTarget.style.background = A.goldBg;
                        }}
                        onMouseLeave={(e) => {
                          if (idx !== images.length - 1) e.currentTarget.style.background = "#F2EFE9";
                        }}
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        Presiona Enter o haz clic fuera para agregar la URL. La imagen en posición <strong>#1</strong> es la principal de la tienda.
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
