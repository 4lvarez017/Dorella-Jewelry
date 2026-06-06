import { A } from "./AdminTheme";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",  icon: "📊", tooltip: "Dashboard"  },
  { id: "inventario", label: "Inventario", icon: "📦", tooltip: "Inventario" },
  { id: "productos",  label: "Productos",  icon: "💍", tooltip: "Productos"  },
  { id: "pedidos",    label: "Pedidos",    icon: "🧾", tooltip: "Pedidos"    },
  { id: "resenas",    label: "Reseñas",    icon: "⭐", tooltip: "Reseñas"    },
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

        {/* ── Logo / Brand ── */}
        <div
          className="sidebar-logo-wrap"
          style={{
            padding: "28px 24px 22px",
            borderBottom: `1px solid ${A.border}`,
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          {/* Ícono crown */}
          <div
            className="sidebar-logo-icon"
            style={{
              width: 38, height: 38, flexShrink: 0,
              background: `linear-gradient(135deg, ${A.gold}, ${A.goldLight})`,
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
              boxShadow: `0 3px 10px rgba(201,168,76,0.35)`,
            }}
          >
            👑
          </div>

          {/* Texto */}
          <div className="sidebar-brand-text">
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 17, fontWeight: 600,
              color: A.goldDark, lineHeight: 1.1,
            }}>
              Dorella Jewelry
            </div>
            <div style={{
              fontSize: 9, letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: A.textMuted, fontWeight: 500, marginTop: 3,
            }}>
              Panel Admin
            </div>
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav style={{ flex: 1, padding: "20px 0" }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: A.textMuted,
            textTransform: "uppercase", letterSpacing: "1.5px",
            padding: "0 24px 12px",
          }}
            className="sidebar-label"
          >
            Módulos
          </div>

          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              data-tooltip={item.tooltip}
              className={`admin-nav-btn${activeTab === item.id ? " active" : ""}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>

              {/* Badge de pedidos pendientes */}
              {item.id === "pedidos" && pendingOrders > 0 && (
                <span className="admin-nav-badge sidebar-label">{pendingOrders}</span>
              )}

              {/* Punto de alerta en mini-mode */}
              {item.id === "pedidos" && pendingOrders > 0 && (
                <span style={{
                  display: "none",
                  position: "absolute",
                  top: 8, right: 8,
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: A.danger,
                  border: "2px solid white",
                }}
                  className="sidebar-mini-dot"
                />
              )}
            </button>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div
          className="sidebar-footer"
          style={{ padding: "20px 20px 28px", borderTop: `1px solid ${A.border}` }}
        >
          {/* Avatar de usuario */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px",
            background: A.bg,
            borderRadius: 12,
            marginBottom: 14,
          }}>
            <div
              className="sidebar-user-avatar"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `linear-gradient(135deg, ${A.gold}40, ${A.goldLight}40)`,
                border: `2px solid ${A.gold}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, flexShrink: 0, fontWeight: 700,
                color: A.goldDark,
              }}
            >
              A
            </div>
            <div className="sidebar-user-info" style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: A.textPrimary,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                Administrador
              </div>
              <div style={{ fontSize: 11, color: A.textMuted }}>Propietario</div>
            </div>
          </div>

          <button className="admin-logout-btn" onClick={onLogout}>
            <span>🚪</span>
            <span className="sidebar-logout-label"> Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CSS adicional para mini-mode dot */}
      <style>{`
        @media (min-width: 769px) and (max-width: 1100px) {
          .sidebar-mini-dot { display: block !important; }
          .sidebar-footer { padding: 12px 0 16px !important; }
          .admin-logout-btn { border-radius: 8px; padding: 10px 0; font-size: 18px; border: none; background: transparent; }
          .admin-logout-btn:hover { background: ${A.dangerBg}; }
        }
      `}</style>
    </>
  );
}
