import { useState, useMemo } from "react";
import { G } from "../styles/theme";
import { useProducts } from "../context/ProductsContext";
import { ProductCard } from "./ProductCard";

const PAGE_SIZE = 24;

// ─── Componente de rango de precio ────────────────────────────────────────────
function PriceRange({ min, max, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.textMuted, letterSpacing: "1px" }}>
        <span>${value[0].toLocaleString("es-CO")}</span>
        <span>${value[1].toLocaleString("es-CO")}</span>
      </div>
      <div style={{ position: "relative", height: 4, borderRadius: 2, background: "rgba(201,168,76,0.15)" }}>
        <div style={{
          position: "absolute",
          height: "100%",
          borderRadius: 2,
          background: `linear-gradient(90deg, ${G.gold}, ${G.goldLight})`,
          left: `${((value[0] - min) / (max - min)) * 100}%`,
          right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
        }} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <input
          type="range" min={min} max={max} step={5000}
          value={value[0]}
          onChange={e => {
            const v = Number(e.target.value);
            if (v < value[1]) onChange([v, value[1]]);
          }}
          style={{ flex: 1, accentColor: G.gold, cursor: "pointer" }}
        />
        <input
          type="range" min={min} max={max} step={5000}
          value={value[1]}
          onChange={e => {
            const v = Number(e.target.value);
            if (v > value[0]) onChange([value[0], v]);
          }}
          style={{ flex: 1, accentColor: G.gold, cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

// ─── Selector de orden ────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "default", label: "Por defecto" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "name_asc", label: "Nombre: A → Z" },
];

export function CatalogSection({ activeCategory, id, onViewDetails }) {
  const { products } = useProducts();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Productos visibles de esta categoría
  const categoryProducts = useMemo(() => {
    const visible = products.filter(p => p.visible !== false);
    if (activeCategory === "Todos") return visible;
    return visible.filter(p => (p.category || "").startsWith(activeCategory));
  }, [products, activeCategory]);

  // Rango de precios dinámico
  const priceMin = useMemo(() => {
    if (!categoryProducts.length) return 0;
    return Math.floor(Math.min(...categoryProducts.map(p => p.price || 0)) / 5000) * 5000;
  }, [categoryProducts]);

  const priceMax = useMemo(() => {
    if (!categoryProducts.length) return 1000000;
    return Math.ceil(Math.max(...categoryProducts.map(p => p.price || 0)) / 5000) * 5000;
  }, [categoryProducts]);

  const [priceRange, setPriceRange] = useState(null);
  const effectiveRange = priceRange || [priceMin, priceMax];

  // Filtrar + buscar + ordenar
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = categoryProducts.filter(p => {
      const inPrice = (p.price || 0) >= effectiveRange[0] && (p.price || 0) <= effectiveRange[1];
      const inSearch = !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.desc || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q);
      return inPrice && inSearch;
    });

    if (sort === "price_asc")  result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "name_asc")   result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [categoryProducts, search, sort, effectiveRange]);

  // Paginación
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayed = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = page * PAGE_SIZE < filtered.length;

  const isDark = activeCategory.includes("Hombre") || activeCategory.includes("Pareja") || activeCategory.includes("Niños");

  // Limpiar página cuando cambian los filtros
  const handleSearch = v => { setSearch(v); setPage(1); };
  const handleSort = v => { setSort(v); setPage(1); };
  const handlePrice = v => { setPriceRange(v); setPage(1); };

  const isFiltered = search || sort !== "default" || (priceRange && (priceRange[0] !== priceMin || priceRange[1] !== priceMax));

  return (
    <section id={id} style={{ background: "transparent", padding: "0 40px 80px", minHeight: "400px" }}>
      <style>{`
        .catalog-search-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.25);
          color: ${G.textDark};
          padding: 12px 16px 12px 44px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          width: 100%;
          border-radius: 2px;
          transition: border-color 0.3s, box-shadow 0.3s;
          letter-spacing: 0.5px;
        }
        .catalog-search-input:focus {
          outline: none;
          border-color: ${G.gold};
          box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
        }
        .catalog-search-input::placeholder { color: ${G.textMuted}; }

        .catalog-sort-select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.25);
          color: ${G.textMid};
          padding: 12px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          border-radius: 2px;
          cursor: pointer;
          transition: border-color 0.3s;
          letter-spacing: 0.5px;
        }
        .catalog-sort-select:focus {
          outline: none;
          border-color: ${G.gold};
        }
        .catalog-sort-select option { background: #1a1918; color: ${G.textDark}; }

        .filter-panel {
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s;
        }

        .load-more-btn {
          background: transparent;
          border: 1px solid rgba(201,168,76,0.4);
          color: ${G.gold};
          padding: 14px 48px;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          border-radius: 2px;
        }
        .load-more-btn:hover {
          background: rgba(201,168,76,0.1);
          border-color: ${G.gold};
          box-shadow: 0 0 20px rgba(201,168,76,0.15);
        }

        .results-count {
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${G.textMuted};
        }

        @media (max-width: 768px) {
          .catalog-toolbar { flex-direction: column !important; }
          .catalog-toolbar-left { width: 100% !important; }
        }
        @media (max-width: 600px) {
          section#${id || "catalog"} { padding: 0 16px 60px !important; }
          .catalog-filters-bar { gap: 8px !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: 32 }}>

        {/* ── Barra de controles ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: 4,
          padding: "16px 20px",
          marginBottom: 28,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}>

          {/* Fila 1: búsqueda + ordenar + filtros toggle */}
          <div className="catalog-toolbar" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Buscador */}
            <div className="catalog-toolbar-left" style={{ flex: 1, minWidth: 220, position: "relative" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.textMuted} strokeWidth="2"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="catalog-search-input"
                type="text"
                placeholder="Buscar joyas..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: G.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}
                >×</button>
              )}
            </div>

            {/* Ordenar */}
            <select className="catalog-sort-select" value={sort} onChange={e => handleSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Botón de filtros */}
            <button
              onClick={() => setFiltersOpen(p => !p)}
              style={{
                background: filtersOpen ? `rgba(201,168,76,0.12)` : "transparent",
                border: `1px solid ${filtersOpen ? G.gold : "rgba(201,168,76,0.3)"}`,
                color: filtersOpen ? G.gold : G.textMid,
                padding: "12px 18px",
                borderRadius: 2,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "1px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.3s",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
              </svg>
              Precio {filtersOpen ? "▲" : "▼"}
            </button>
          </div>

          {/* Fila 2: filtro de precio (colapsable) */}
          <div className="filter-panel" style={{ maxHeight: filtersOpen ? 120 : 0, opacity: filtersOpen ? 1 : 0 }}>
            {priceMin < priceMax && (
              <PriceRange
                min={priceMin}
                max={priceMax}
                value={effectiveRange}
                onChange={handlePrice}
              />
            )}
          </div>

          {/* Conteo y limpiar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span className="results-count">
              {filtered.length === categoryProducts.length
                ? `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`
                : `${filtered.length} de ${categoryProducts.length} producto${categoryProducts.length !== 1 ? "s" : ""}`
              }
            </span>
            {isFiltered && (
              <button
                onClick={() => { setSearch(""); setSort("default"); setPriceRange(null); setPage(1); setFiltersOpen(false); }}
                style={{ background: "none", border: "none", color: G.textMuted, cursor: "pointer", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", textDecoration: "underline" }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* ── Grid de productos ── */}
        {displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: G.gold }}>
            {search ? (
              <>
                <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
                <p className="serif" style={{ fontSize: 24 }}>No encontramos "{search}"</p>
                <p style={{ fontSize: 13, color: G.textMuted, marginTop: 8 }}>Intenta con otro término o limpia los filtros</p>
              </>
            ) : (
              <>
                <p className="serif" style={{ fontSize: 24 }}>Próximamente en esta categoría...</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="product-grid">
              {displayed.map(p => (
                <ProductCard key={p.id} product={p} dark={isDark} onViewDetails={onViewDetails} />
              ))}
            </div>

            {/* ── Cargar más / paginación ── */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>
                  Cargar más productos
                </button>
                <span style={{ fontSize: 11, color: G.textMuted, letterSpacing: "1px" }}>
                  Mostrando {displayed.length} de {filtered.length}
                </span>
              </div>
            )}

            {!hasMore && filtered.length > PAGE_SIZE && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <span style={{ fontSize: 11, color: G.textMuted, letterSpacing: "2px", textTransform: "uppercase" }}>
                  — Todos los productos cargados —
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
