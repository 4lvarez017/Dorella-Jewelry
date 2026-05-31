import { A } from "./AdminTheme";

const TAB_TITLES = {
  dashboard:  "Dashboard",
  inventario: "Inventario",
  productos:  "Productos",
  pedidos:    "Pedidos",
};

export function AdminHeader({ activeTab, onMenuOpen, onAddProduct, selectedProdCategory }) {
  const showAdd = activeTab === "productos" && !!selectedProdCategory;

  return (
    <header className="admin-mobile-header">
      {/* Hamburger */}
      <button
        onClick={onMenuOpen}
        style={{
          background: "none", border: "none",
          cursor: "pointer", padding: 4,
          display: "flex", flexDirection: "column", gap: 5,
        }}
        aria-label="Abrir menú"
      >
        {[0,1,2].map(i => (
          <span key={i} style={{
            display: "block",
            width: i === 1 ? 18 : 24,
            height: 2,
            background: A.textPrimary,
            borderRadius: 2,
            transition: "width 0.2s",
          }} />
        ))}
      </button>

      {/* Logo centrado */}
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 19,
        fontWeight: 600,
        color: A.goldDark,
        letterSpacing: "0.5px",
      }}>
        {TAB_TITLES[activeTab] || "Admin"}
      </div>

      {/* CTA contextual */}
      {showAdd ? (
        <button
          onClick={onAddProduct}
          style={{
            background: A.gold,
            border: "none", borderRadius: 8,
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(201,168,76,0.35)",
            color: "#FFF",
          }}
          aria-label="Nuevo producto"
        >
          +
        </button>
      ) : (
        <div style={{ width: 34 }} />
      )}
    </header>
  );
}
