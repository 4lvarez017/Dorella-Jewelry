import { A } from "./AdminTheme";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",  icon: "📊" },
  { id: "inventario", label: "Inventario", icon: "📦" },
  { id: "productos",  label: "Productos",  icon: "💍" },
  { id: "pedidos",    label: "Pedidos",    icon: "🧾" },
];

export function AdminSidebar({ activeTab, onTabChange, onLogout, pendingOrders, isOpen, onClose }) {
  return (
    <>
      {/* Backdrop (móvil) */}
      <div
        className={`admin-sidebar-backdrop${isOpen ? " open" : ""}`}
        onClick={onClose}
      />

      <aside className={`admin-sidebar${isOpen ? " open" : ""}`}>
        {/* ── Logo ── */}
        <div style={{ padding: "28px 24px 24px", borderBottom: `1px solid ${A.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 36, height: 36,
              background: `linear-gradient(135deg, ${A.gold}, ${A.goldLight})`,
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
              boxShadow: "0 2px 8px rgba(201,168,76,0.3)",
            }}>
              👑
            </div>
            <div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 17,
                fontWeight: 600,
                color: A.goldDark,
                lineHeight: 1.1,
              }}>
                Dorella Jewelry
              </div>
              <div style={{
                fontSize: 9,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: A.textMuted,
                fontWeight: 500,
                marginTop: 3,
              }}>
                Panel Admin
              </div>
            </div>
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: A.textMuted,
            textTransform: "uppercase", letterSpacing: "1.5px",
            padding: "0 24px 10px",
          }}>
            Módulos
          </div>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-btn${activeTab === item.id ? " active" : ""}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "pedidos" && pendingOrders > 0 && (
                <span className="admin-nav-badge">{pendingOrders}</span>
              )}
            </button>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div style={{ padding: "20px 20px 28px", borderTop: `1px solid ${A.border}` }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px",
            background: A.bg,
            borderRadius: 10,
            marginBottom: 14,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: `linear-gradient(135deg, ${A.gold}30, ${A.goldLight}30)`,
              border: `1.5px solid ${A.gold}50`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>
              👤
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: A.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Administrador
              </div>
              <div style={{ fontSize: 11, color: A.textMuted }}>Propietario</div>
            </div>
          </div>

          <button className="admin-logout-btn" onClick={onLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
