import { useState, useEffect, useMemo } from "react";
import { A, CATEGORIES_LIST } from "./AdminTheme";
import { useProducts } from "../../context/ProductsContext";

export function ReorderTab({ addToast }) {
  const { products, reorderProducts } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [saving, setSaving] = useState(false);

  // Lista local editable para reordenar
  const [items, setItems] = useState([]);
  const [originalOrderIds, setOriginalOrderIds] = useState([]);

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Inicializar items cuando cambian los productos o la categoría
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== "Todos") {
      const targetCat = selectedCategory.trim().toLowerCase();
      filtered = filtered.filter(
        (p) => (p.category || "").trim().toLowerCase() === targetCat
      );
    }

    // Orden inicial: por p.order, fallback alfabético
    filtered.sort((a, b) => {
      const ordA = a.order !== undefined && a.order !== null ? Number(a.order) : 999999;
      const ordB = b.order !== undefined && b.order !== null ? Number(b.order) : 999999;
      if (ordA !== ordB) return ordA - ordB;
      return (a.name || "").localeCompare(b.name || "", "es");
    });

    setItems(filtered);
    setOriginalOrderIds(filtered.map((p) => p.id));
  }, [products, selectedCategory]);

  // Detección de cambios sin guardar
  const hasChanges = useMemo(() => {
    if (items.length !== originalOrderIds.length) return false;
    return items.some((p, idx) => p.id !== originalOrderIds[idx]);
  }, [items, originalOrderIds]);

  // Filtrar por búsqueda si el usuario escribe
  const displayItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.desc || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  // ── Handlers de Movimiento ──────────────────────────────────────────────────
  const moveItem = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= items.length) return;
    setItems((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const moveUp = (index) => moveItem(index, index - 1);
  const moveDown = (index) => moveItem(index, index + 1);
  const moveToTop = (index) => moveItem(index, 0);
  const moveToBottom = (index) => moveItem(index, items.length - 1);

  const jumpToPosition = (fromIndex, targetPosStr) => {
    const targetPos = parseInt(targetPosStr, 10);
    if (isNaN(targetPos)) return;
    const targetIndex = Math.max(0, Math.min(items.length - 1, targetPos - 1));
    moveItem(fromIndex, targetIndex);
  };

  // ── Drag & Drop HTML5 ───────────────────────────────────────────────────────
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e, index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, toIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      moveItem(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ── Presets de ordenamiento rápido ──────────────────────────────────────────
  const sortAlphabetical = () => {
    setItems((prev) =>
      [...prev].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" })
      )
    );
    addToast?.("Productos organizados alfabéticamente (recuerda guardar cambios)", "info");
  };

  const sortByPriceAsc = () => {
    setItems((prev) => [...prev].sort((a, b) => (a.price || 0) - (b.price || 0)));
    addToast?.("Productos organizados por precio menor a mayor", "info");
  };

  const sortByPriceDesc = () => {
    setItems((prev) => [...prev].sort((a, b) => (b.price || 0) - (a.price || 0)));
    addToast?.("Productos organizados por precio mayor a menor", "info");
  };

  const reverseOrder = () => {
    setItems((prev) => [...prev].reverse());
    addToast?.("Orden invertido", "info");
  };

  const resetOrder = () => {
    let filtered = [...products];
    if (selectedCategory !== "Todos") {
      const targetCat = selectedCategory.trim().toLowerCase();
      filtered = filtered.filter(
        (p) => (p.category || "").trim().toLowerCase() === targetCat
      );
    }
    filtered.sort((a, b) => {
      const ordA = a.order !== undefined && a.order !== null ? Number(a.order) : 999999;
      const ordB = b.order !== undefined && b.order !== null ? Number(b.order) : 999999;
      if (ordA !== ordB) return ordA - ordB;
      return (a.name || "").localeCompare(b.name || "", "es");
    });
    setItems(filtered);
    addToast?.("Orden restablecido al estado guardado", "info");
  };

  // ── Guardar en Firebase ─────────────────────────────────────────────────────
  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      await reorderProducts(items);
      setOriginalOrderIds(items.map((p) => p.id));
      addToast?.("✨ ¡Nuevo orden guardado exitosamente y publicado en la tienda!", "success");
    } catch (err) {
      console.error("Error al guardar el orden en Firebase:", err);
      addToast?.("Error al guardar orden: " + (err.message || "intenta de nuevo"), "error");
    } finally {
      setSaving(false);
    }
  };

  // Categorías con conteo
  const allCategories = useMemo(() => {
    const list = [{ name: "Todos", icon: "💎", count: products.length }];
    CATEGORIES_LIST.forEach((cat) => {
      const target = cat.name.trim().toLowerCase();
      const count = products.filter(
        (p) => (p.category || "").trim().toLowerCase() === target
      ).length;
      list.push({ ...cat, count });
    });
    return list;
  }, [products]);

  return (
    <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Barra superior informativa con cambios pendientes ── */}
      <div
        style={{
          background: hasChanges ? "rgba(201,168,76,0.12)" : A.cardBg,
          border: `1px solid ${hasChanges ? A.gold : A.border}`,
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          boxShadow: hasChanges ? A.shadowGold : A.shadowSm,
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${A.gold}, ${A.goldDark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            ↕️
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: A.textPrimary,
                  margin: 0,
                }}
              >
                Acomodar Orden del Catálogo
              </h2>
              {hasChanges && (
                <span
                  className="status-badge"
                  style={{
                    background: A.warningBg,
                    color: A.warning,
                    fontSize: 11,
                    fontWeight: 700,
                    animation: "pulse 2s infinite",
                  }}
                >
                  ⚠️ Cambios sin guardar
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: A.textSecondary, margin: "4px 0 0" }}>
              Arrastra las piezas (Drag & Drop) o usa las flechas para colocarlas en la posición que verán los clientes en la tienda.
            </p>
          </div>
        </div>

        {/* Acciones principales de guardado */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {hasChanges && (
            <button
              onClick={resetOrder}
              disabled={saving}
              className="admin-btn-secondary"
              style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600 }}
              title="Deshacer los cambios de orden no guardados"
            >
              🔄 Deshacer
            </button>
          )}

          <button
            onClick={handleSaveOrder}
            disabled={saving || !hasChanges}
            className="admin-btn-primary"
            style={{
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: hasChanges ? 1 : 0.65,
              cursor: hasChanges ? "pointer" : "not-allowed",
              boxShadow: hasChanges ? `0 4px 14px rgba(201,168,76,0.4)` : "none",
            }}
          >
            {saving ? "⏳ Guardando..." : "💾 Guardar Orden en Vivo"}
          </button>
        </div>
      </div>

      {/* ── Filtro por Categorías (Selector y Chips de acceso rápido) ── */}
      <div
        style={{
          background: A.cardBg,
          border: `1px solid ${A.border}`,
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: A.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
            Filtrar Colección a Ordenar
          </span>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Buscador de piezas */}
            <div style={{ position: "relative", minWidth: 220 }}>
              <input
                type="text"
                placeholder="Buscar joya en esta lista..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input"
                style={{ padding: "7px 12px 7px 32px", fontSize: 12, width: "100%" }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: A.textMuted }}>
                🔍
              </span>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: A.textMuted,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Alternador de vista Grilla / Lista */}
            <div style={{ display: "flex", background: A.bg, padding: 3, borderRadius: 8, border: `1px solid ${A.border}` }}>
              <button
                onClick={() => setViewMode("grid")}
                title="Vista Cuadrícula Visual"
                style={{
                  border: "none",
                  background: viewMode === "grid" ? "#fff" : "transparent",
                  color: viewMode === "grid" ? A.goldDark : A.textMuted,
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: viewMode === "grid" ? A.shadowSm : "none",
                  transition: "all 0.2s",
                }}
              >
                🖼️ Cuadrícula
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="Vista Lista Compacta"
                style={{
                  border: "none",
                  background: viewMode === "list" ? "#fff" : "transparent",
                  color: viewMode === "list" ? A.goldDark : A.textMuted,
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: viewMode === "list" ? A.shadowSm : "none",
                  transition: "all 0.2s",
                }}
              >
                📑 Lista
              </button>
            </div>
          </div>
        </div>

        {/* Chips de Categorías con scroll horizontal suave */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  if (hasChanges) {
                    if (
                      window.confirm(
                        "Tienes cambios de orden sin guardar. ¿Deseas cambiar de categoría y descartarlos?"
                      )
                    ) {
                      setSelectedCategory(cat.name);
                    }
                  } else {
                    setSelectedCategory(cat.name);
                  }
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  border: `1px solid ${isSelected ? A.gold : A.border}`,
                  background: isSelected
                    ? `linear-gradient(135deg, ${A.gold}, ${A.goldDark})`
                    : "#fff",
                  color: isSelected ? "#fff" : A.textPrimary,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: isSelected ? A.shadowGold : "none",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <span>{cat.icon || "💍"}</span>
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: 10,
                    background: isSelected ? "rgba(255,255,255,0.25)" : A.bg,
                    color: isSelected ? "#fff" : A.textMuted,
                    padding: "2px 6px",
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Herramientas de ordenamiento rápido */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingTop: 8,
            borderTop: `1px solid ${A.border}`,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 11, color: A.textMuted, fontWeight: 600 }}>
            Herramientas Rápidas:
          </span>
          <button
            onClick={sortAlphabetical}
            className="admin-btn-secondary"
            style={{ padding: "5px 10px", fontSize: 11, borderRadius: 6 }}
            title="Ordenar alfabéticamente A-Z como base"
          >
            🔤 Nombre A-Z
          </button>
          <button
            onClick={sortByPriceAsc}
            className="admin-btn-secondary"
            style={{ padding: "5px 10px", fontSize: 11, borderRadius: 6 }}
            title="Ordenar del más económico al más costoso"
          >
            💲 Precio: Menor a Mayor
          </button>
          <button
            onClick={sortByPriceDesc}
            className="admin-btn-secondary"
            style={{ padding: "5px 10px", fontSize: 11, borderRadius: 6 }}
            title="Ordenar del más costoso al más económico"
          >
            💎 Precio: Mayor a Menor
          </button>
          <button
            onClick={reverseOrder}
            className="admin-btn-secondary"
            style={{ padding: "5px 10px", fontSize: 11, borderRadius: 6 }}
            title="Invertir el orden actual"
          >
            🔄 Invertir
          </button>

          <span style={{ marginLeft: "auto", fontSize: 11, color: A.textSecondary }}>
            Mostrando <strong>{displayItems.length}</strong> de {items.length} joyas
          </span>
        </div>
      </div>

      {/* ── Aviso cuando hay búsqueda activa ── */}
      {search && (
        <div
          style={{
            background: A.warningBg,
            border: `1px solid ${A.warning}40`,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: A.warning,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>ℹ️</span>
          <span>
            Hay un filtro de búsqueda activo (&ldquo;{search}&rdquo;). Para una mejor experiencia de arrastrar y soltar, te sugerimos limpiar la búsqueda para ver la lista continua completa.
          </span>
        </div>
      )}

      {/* ── VISTA CUADRÍCULA (GRID) ── */}
      {viewMode === "grid" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {displayItems.map((p) => {
            const realIndex = items.findIndex((item) => item.id === p.id);
            const isDragging = draggedIndex === realIndex;
            const isDropTarget = dragOverIndex === realIndex;
            const position = realIndex + 1;

            return (
              <div
                key={p.id}
                draggable={!search}
                onDragStart={(e) => handleDragStart(e, realIndex)}
                onDragOver={(e) => handleDragOver(e, realIndex)}
                onDragLeave={(e) => handleDragLeave(e, realIndex)}
                onDrop={(e) => handleDrop(e, realIndex)}
                onDragEnd={handleDragEnd}
                style={{
                  background: A.cardBg,
                  borderRadius: 12,
                  border: `2px solid ${
                    isDropTarget
                      ? A.gold
                      : isDragging
                      ? A.borderStrong
                      : A.border
                  }`,
                  overflow: "hidden",
                  boxShadow: isDropTarget
                    ? `0 0 16px rgba(201,168,76,0.5)`
                    : isDragging
                    ? "none"
                    : A.shadowSm,
                  opacity: isDragging ? 0.4 : 1,
                  transform: isDropTarget ? "scale(1.02)" : "scale(1)",
                  transition: "border 0.2s, transform 0.2s, box-shadow 0.2s, opacity 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  cursor: search ? "default" : "grab",
                  userSelect: "none",
                  position: "relative",
                }}
              >
                {/* Tirador y Badge de Posición */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      background: position === 1
                        ? `linear-gradient(135deg, ${A.gold}, ${A.goldDark})`
                        : "rgba(30,30,32,0.85)",
                      color: "#fff",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      backdropFilter: "blur(6px)",
                      boxShadow: position === 1 ? `0 2px 8px rgba(201,168,76,0.6)` : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {position === 1 && <span>👑</span>}
                    <span>#{position}</span>
                  </div>
                </div>

                {/* Categoría Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 3,
                    background: "rgba(255,255,255,0.92)",
                    color: A.goldDark,
                    border: `1px solid ${A.gold}60`,
                    borderRadius: 14,
                    padding: "2px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {p.category}
                </div>

                {/* Imagen del producto */}
                <div
                  style={{
                    width: "100%",
                    height: 160,
                    position: "relative",
                    background: "#F5F3EF",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={(p.image || "/placeholder.jpg").replace(/\.(png|jpg|jpeg)$/i, ".webp")}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80";
                    }}
                  />

                  {/* Icono de arrastre superpuesto */}
                  {!search && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "3px 7px",
                        fontSize: 11,
                        backdropFilter: "blur(4px)",
                      }}
                      title="Arrastra para mover"
                    >
                      ⠿ Arrastrar
                    </div>
                  )}
                </div>

                {/* Info del producto */}
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: A.textPrimary,
                      lineHeight: 1.3,
                      marginBottom: 4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: 34,
                    }}
                  >
                    {p.name}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: A.goldDark,
                      fontFamily: "'Jost', sans-serif",
                      marginBottom: 10,
                    }}
                  >
                    ${(p.price || 0).toLocaleString("es-CO")}
                  </div>

                  {/* Controles de posición manual */}
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 10,
                      borderTop: `1px solid ${A.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 4,
                    }}
                  >
                    {/* Botones de navegación de posición */}
                    <div style={{ display: "flex", gap: 3 }}>
                      <button
                        onClick={() => moveToTop(realIndex)}
                        disabled={realIndex === 0}
                        title="Mover al inicio (#1)"
                        className="admin-btn-secondary"
                        style={{ padding: "4px 7px", fontSize: 11, opacity: realIndex === 0 ? 0.3 : 1 }}
                      >
                        🔝
                      </button>
                      <button
                        onClick={() => moveUp(realIndex)}
                        disabled={realIndex === 0}
                        title="Subir una posición"
                        className="admin-btn-secondary"
                        style={{ padding: "4px 8px", fontSize: 11, opacity: realIndex === 0 ? 0.3 : 1 }}
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={() => moveDown(realIndex)}
                        disabled={realIndex === items.length - 1}
                        title="Bajar una posición"
                        className="admin-btn-secondary"
                        style={{ padding: "4px 8px", fontSize: 11, opacity: realIndex === items.length - 1 ? 0.3 : 1 }}
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => moveToBottom(realIndex)}
                        disabled={realIndex === items.length - 1}
                        title="Mover al final"
                        className="admin-btn-secondary"
                        style={{ padding: "4px 7px", fontSize: 11, opacity: realIndex === items.length - 1 ? 0.3 : 1 }}
                      >
                        🔚
                      </button>
                    </div>

                    {/* Salto numérico directo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 10, color: A.textMuted }}>Puesto:</span>
                      <input
                        type="number"
                        min="1"
                        max={items.length}
                        defaultValue={position}
                        key={`input-${p.id}-${position}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            jumpToPosition(realIndex, e.target.value);
                          }
                        }}
                        onBlur={(e) => {
                          if (Number(e.target.value) !== position) {
                            jumpToPosition(realIndex, e.target.value);
                          }
                        }}
                        style={{
                          width: 44,
                          padding: "3px 4px",
                          fontSize: 11,
                          textAlign: "center",
                          borderRadius: 6,
                          border: `1px solid ${A.border}`,
                          fontWeight: 700,
                          color: A.textPrimary,
                        }}
                        title="Escribe un número y presiona Enter para mover a esa posición"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VISTA LISTA COMPACTA (LIST) ── */}
      {viewMode === "list" && (
        <div
          style={{
            background: A.cardBg,
            border: `1px solid ${A.border}`,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: A.shadowSm,
          }}
        >
          {/* Cabecera de la tabla */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 50px 70px 1fr 130px 120px 200px",
              padding: "12px 16px",
              background: A.surfaceBg,
              borderBottom: `1px solid ${A.border}`,
              fontSize: 11,
              fontWeight: 700,
              color: A.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              alignItems: "center",
            }}
          >
            <span>Orden</span>
            <span>Mover</span>
            <span>Foto</span>
            <span>Nombre de la Joya</span>
            <span>Categoría</span>
            <span style={{ textAlign: "right" }}>Precio</span>
            <span style={{ textAlign: "center" }}>Acciones de Posición</span>
          </div>

          {/* Filas reordenables */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {displayItems.map((p, index) => {
              const realIndex = items.findIndex((item) => item.id === p.id);
              const isDragging = draggedIndex === realIndex;
              const isDropTarget = dragOverIndex === realIndex;
              const position = realIndex + 1;

              return (
                <div
                  key={p.id}
                  draggable={!search}
                  onDragStart={(e) => handleDragStart(e, realIndex)}
                  onDragOver={(e) => handleDragOver(e, realIndex)}
                  onDragLeave={(e) => handleDragLeave(e, realIndex)}
                  onDrop={(e) => handleDrop(e, realIndex)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 50px 70px 1fr 130px 120px 200px",
                    padding: "10px 16px",
                    borderBottom: `1px solid ${A.border}`,
                    alignItems: "center",
                    background: isDropTarget
                      ? "rgba(201,168,76,0.15)"
                      : isDragging
                      ? "rgba(0,0,0,0.05)"
                      : index % 2 === 0
                      ? "#FFFFFF"
                      : "#FCFAF7",
                    opacity: isDragging ? 0.35 : 1,
                    transition: "background 0.15s",
                    cursor: search ? "default" : "grab",
                  }}
                >
                  {/* Badge de orden */}
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: 12,
                        background: position === 1 ? A.goldDark : A.bg,
                        color: position === 1 ? "#fff" : A.textPrimary,
                        fontSize: 11,
                        fontWeight: 800,
                        border: `1px solid ${position === 1 ? A.goldDark : A.border}`,
                      }}
                    >
                      #{position}
                    </span>
                  </div>

                  {/* Tirador */}
                  <div
                    style={{
                      color: A.textMuted,
                      fontSize: 18,
                      cursor: "grab",
                      userSelect: "none",
                    }}
                    title="Arrastra para mover"
                  >
                    ⠿
                  </div>

                  {/* Miniatura */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#F5F3EF",
                      border: `1px solid ${A.border}`,
                    }}
                  >
                    <img
                      src={(p.image || "/placeholder.jpg").replace(/\.(png|jpg|jpeg)$/i, ".webp")}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80";
                      }}
                    />
                  </div>

                  {/* Nombre */}
                  <div style={{ paddingRight: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: A.textPrimary }}>
                      {p.name}
                    </div>
                    {p.desc && (
                      <div
                        style={{
                          fontSize: 11,
                          color: A.textMuted,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 320,
                        }}
                      >
                        {p.desc}
                      </div>
                    )}
                  </div>

                  {/* Categoría */}
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 10,
                        background: A.bg,
                        color: A.textSecondary,
                        fontWeight: 600,
                        border: `1px solid ${A.border}`,
                      }}
                    >
                      {p.category}
                    </span>
                  </div>

                  {/* Precio */}
                  <div
                    style={{
                      textAlign: "right",
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: 700,
                      color: A.goldDark,
                      fontSize: 14,
                    }}
                  >
                    ${(p.price || 0).toLocaleString("es-CO")}
                  </div>

                  {/* Controles de posición */}
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => moveToTop(realIndex)}
                      disabled={realIndex === 0}
                      title="Mover al primer lugar (#1)"
                      className="admin-btn-secondary"
                      style={{ padding: "4px 6px", fontSize: 11, opacity: realIndex === 0 ? 0.3 : 1 }}
                    >
                      🔝
                    </button>
                    <button
                      onClick={() => moveUp(realIndex)}
                      disabled={realIndex === 0}
                      title="Subir un puesto"
                      className="admin-btn-secondary"
                      style={{ padding: "4px 7px", fontSize: 11, opacity: realIndex === 0 ? 0.3 : 1 }}
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => moveDown(realIndex)}
                      disabled={realIndex === items.length - 1}
                      title="Bajar un puesto"
                      className="admin-btn-secondary"
                      style={{ padding: "4px 7px", fontSize: 11, opacity: realIndex === items.length - 1 ? 0.3 : 1 }}
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => moveToBottom(realIndex)}
                      disabled={realIndex === items.length - 1}
                      title="Mover al final"
                      className="admin-btn-secondary"
                      style={{ padding: "4px 6px", fontSize: 11, opacity: realIndex === items.length - 1 ? 0.3 : 1 }}
                    >
                      🔚
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={items.length}
                      defaultValue={position}
                      key={`input-list-${p.id}-${position}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          jumpToPosition(realIndex, e.target.value);
                        }
                      }}
                      onBlur={(e) => {
                        if (Number(e.target.value) !== position) {
                          jumpToPosition(realIndex, e.target.value);
                        }
                      }}
                      style={{
                        width: 44,
                        padding: "3px 4px",
                        fontSize: 11,
                        textAlign: "center",
                        borderRadius: 6,
                        border: `1px solid ${A.border}`,
                        fontWeight: 700,
                        color: A.textPrimary,
                      }}
                      title="Escribe un puesto y pulsa Enter"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Botón Flotante para Guardar cuando hay cambios ── */}
      {hasChanges && (
        <div
          style={{
            position: "sticky",
            bottom: 24,
            alignSelf: "center",
            zIndex: 100,
            background: "rgba(29,29,31,0.92)",
            backdropFilter: "blur(10px)",
            padding: "12px 24px",
            borderRadius: 30,
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            border: `1px solid ${A.gold}`,
          }}
        >
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
            ⚠️ Tienes cambios en el orden sin guardar
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={resetOrder}
              disabled={saving}
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "none",
                borderRadius: 20,
                padding: "8px 16px",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Deshacer
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="admin-btn-primary"
              style={{
                padding: "8px 22px",
                fontSize: 12,
                borderRadius: 20,
                fontWeight: 700,
              }}
            >
              {saving ? "⏳ Guardando..." : "💾 Guardar en Tienda"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
