import { useState, useEffect, useCallback } from "react";
import { A } from "./AdminTheme";
import { fetchAllReviews, deleteReview } from "../../lib/supabase";

// ─── Estrellas ────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span style={{ color: A.gold, fontSize: 14, letterSpacing: 1 }}>
      {"★".repeat(rating)}
      <span style={{ color: A.border }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

// ─── Tab Principal ─────────────────────────────────────────────────────────────
export function ReviewsTab({ addToast, showConfirm }) {
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterRating, setFilterRating] = useState(0); // 0 = todos

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (rev) => {
    showConfirm(
      `¿Eliminar la opinión de "${rev.name}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await deleteReview(rev.id);
          setReviews(prev => prev.filter(r => r.id !== rev.id));
          addToast("Opinión eliminada", "error");
        } catch {
          addToast("Error al eliminar", "error");
        }
      }
    );
  };

  // Filtrado
  const filtered = reviews.filter(r => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      r.name.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      (r.product_id || "").toLowerCase().includes(q);
    const matchRating = filterRating === 0 || r.rating === filterRating;
    return matchSearch && matchRating;
  });

  // Stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const countByRating = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  return (
    <div className="admin-section-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Stats cards ── */}
      <div className="admin-grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {/* Total */}
        <div className="admin-metric-card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 11, color: A.textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
            Total Opiniones
          </p>
          <p style={{ fontSize: 32, fontWeight: 700, color: A.goldDark }}>{reviews.length}</p>
        </div>
        {/* Promedio */}
        <div className="admin-metric-card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 11, color: A.textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
            Calificación Prom.
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: A.goldDark }}>{avgRating}</p>
            <span style={{ color: A.gold, fontSize: 18 }}>★</span>
          </div>
        </div>
        {/* 5 estrellas */}
        <div className="admin-metric-card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 11, color: A.textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
            5 Estrellas
          </p>
          <p style={{ fontSize: 32, fontWeight: 700, color: A.success }}>
            {reviews.filter(r => r.rating === 5).length}
          </p>
        </div>
      </div>

      {/* ── Distribución de calificaciones ── */}
      <div style={{
        background: A.cardBg, border: `1px solid ${A.border}`,
        borderRadius: 14, padding: "18px 20px", boxShadow: A.shadowSm,
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: A.textSecondary, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>
          Distribución de estrellas
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {countByRating.map(({ star, count }) => {
            const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                  style={{
                    background: filterRating === star ? A.goldBg : "none",
                    border: filterRating === star ? `1px solid ${A.gold}` : "1px solid transparent",
                    borderRadius: 6, padding: "2px 8px", cursor: "pointer",
                    fontSize: 12, fontWeight: 600, color: A.goldDark,
                    transition: "all 0.2s",
                  }}
                >
                  {star}★
                </button>
                <div style={{ flex: 1, height: 8, background: A.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${pct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${A.gold}, ${A.goldLight})`,
                    borderRadius: 4, transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
                  }} />
                </div>
                <span style={{ fontSize: 12, color: A.textMuted, width: 28, textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Barra de controles ── */}
      <div style={{
        background: A.cardBg, border: `1px solid ${A.border}`,
        borderRadius: 14, padding: "14px 18px",
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
        boxShadow: A.shadowSm,
      }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: A.textMuted, pointerEvents: "none" }}>🔍</span>
          <input
            className="admin-input"
            type="text"
            placeholder="Buscar por nombre, comentario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        {filterRating > 0 && (
          <button
            className="admin-btn-secondary"
            style={{ fontSize: 12, padding: "8px 14px" }}
            onClick={() => setFilterRating(0)}
          >
            Limpiar filtro ({filterRating}★)
          </button>
        )}
        <button
          className="admin-btn-secondary"
          style={{ fontSize: 12, padding: "8px 14px", flexShrink: 0 }}
          onClick={load}
          disabled={loading}
        >
          {loading ? "..." : "🔄 Actualizar"}
        </button>
      </div>

      {/* ── Contador ── */}
      <p style={{ fontSize: 12, color: A.textMuted }}>
        <span style={{ fontWeight: 600, color: A.textSecondary }}>{filtered.length}</span>{" "}
        {filtered.length === 1 ? "opinión" : "opiniones"}
        {filterRating > 0 && <> · <span style={{ color: A.goldDark, fontWeight: 600 }}>{filterRating} ★</span></>}
        {search && <> · "{search}"</>}
      </p>

      {/* ── Lista de reseñas ── */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <div style={{
            width: 36, height: 36, margin: "0 auto 12px",
            border: `3px solid ${A.border}`, borderTopColor: A.gold,
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: 13, color: A.textMuted }}>Cargando opiniones...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: A.cardBg, border: `1px solid ${A.border}`,
          borderRadius: 16, padding: "60px 24px", textAlign: "center",
          boxShadow: A.shadowSm,
        }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>⭐</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: A.textPrimary, marginBottom: 8 }}>
            {reviews.length === 0 ? "Aún no hay opiniones" : "Sin resultados"}
          </p>
          <p style={{ fontSize: 13, color: A.textMuted }}>
            {reviews.length === 0
              ? "Las opiniones de los clientes aparecerán aquí."
              : "Intenta con otro filtro o búsqueda."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(rev => (
            <div
              key={rev.id}
              style={{
                background: A.cardBg, border: `1px solid ${A.border}`,
                borderRadius: 12, padding: "16px 20px",
                boxShadow: A.shadowSm,
                display: "flex", flexDirection: "column", gap: 8,
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = A.shadowMd}
              onMouseLeave={e => e.currentTarget.style.boxShadow = A.shadowSm}
            >
              {/* Fila superior */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Avatar inicial */}
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: A.goldBg, border: `1px solid ${A.gold}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: A.goldDark, flexShrink: 0,
                  }}>
                    {rev.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: A.textPrimary, lineHeight: 1.2 }}>{rev.name}</p>
                    <p style={{ fontSize: 11, color: A.textMuted }}>
                      ID producto: <code style={{ fontSize: 10, background: A.bg, padding: "1px 5px", borderRadius: 3 }}>{rev.product_id}</code>
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <Stars rating={rev.rating} />
                  <span style={{ fontSize: 11, color: A.textMuted }}>
                    {rev.created_at
                      ? new Date(rev.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </span>
                  <button
                    className="admin-btn-danger"
                    style={{ padding: "5px 10px", fontSize: 12 }}
                    onClick={() => handleDelete(rev)}
                    title="Eliminar opinión"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>

              {/* Comentario */}
              <p style={{
                fontSize: 13, color: A.textSecondary, lineHeight: 1.65,
                paddingLeft: 50,
                borderLeft: `2px solid ${A.border}`,
                marginLeft: 18,
                paddingTop: 4,
              }}>
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
