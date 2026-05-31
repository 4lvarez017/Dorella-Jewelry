import { A } from "./AdminTheme";

const TAB_TITLES = {
  dashboard:  "Dashboard",
  inventario: "Inventario",
  productos:  "Productos",
  pedidos:    "Pedidos",
};

export function AdminHeader({ activeTab, onMenuOpen, isOpen, pendingOrders, onAddProduct }) {
  const showAdd = activeTab === "productos";

  return (
    <header className="admin-mobile-header">
      {/* ── Hamburguesa animada ── */}
      <button
        onClick={onMenuOpen}
        className={`admin-hamburger${isOpen ? " open" : ""}`}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        style={{ position: "relative" }}
      >
        <span />
        <span />
        <span />

        {/* Badge de pedidos pendientes sobre el hamburger */}
        {pendingOrders > 0 && !isOpen && (
          <span style={{
            position: "absolute", top: -4, right: -6,
            minWidth: 16, height: 16, borderRadius: 8,
            background: A.danger, color: "#fff",
            fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid white",
            padding: "0 3px",
            animation: "pulseBadge 2s infinite",
          }}>
            {pendingOrders > 9 ? "9+" : pendingOrders}
          </span>
        )}
      </button>

      {/* ── Título de sección ── */}
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 19, fontWeight: 600,
        color: A.goldDark, letterSpacing: "0.5px",
        textAlign: "center",
      }}>
        {TAB_TITLES[activeTab] || "Admin"}
      </div>

      {/* ── CTA contextual (solo en Productos) ── */}
      {showAdd ? (
        <button
          onClick={onAddProduct}
          style={{
            background: `linear-gradient(135deg, ${A.gold}, ${A.goldLight})`,
            border: "none", borderRadius: 9,
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, cursor: "pointer", lineHeight: 1,
            boxShadow: `0 2px 10px rgba(201,168,76,0.40)`,
            color: "#FFF", fontWeight: 700,
          }}
          aria-label="Nuevo producto"
        >
          +
        </button>
      ) : (
        <div style={{ width: 36 }} />
      )}
    </header>
  );
}
