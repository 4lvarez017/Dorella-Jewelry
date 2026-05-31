// ─── ADMIN PANEL DESIGN TOKENS ────────────────────────────────────────────────
export const A = {
  // Base
  bg: "#F7F5F2",
  cardBg: "#FFFFFF",
  sidebarBg: "#FFFFFF",

  // Text
  textPrimary: "#1D1D1F",
  textSecondary: "#6B6B70",
  textMuted: "#A0A0A8",

  // Gold palette
  gold: "#C9A84C",
  goldDark: "#9A7A2E",
  goldLight: "#E8C96B",
  goldGlow: "rgba(201,168,76,0.18)",
  goldBg: "rgba(201,168,76,0.07)",

  // Borders
  border: "#EDE9E3",
  borderStrong: "#D9D3CA",

  // Status
  danger: "#E53935",
  dangerBg: "rgba(229,57,53,0.08)",
  success: "#2E7D32",
  successBg: "rgba(46,125,50,0.08)",
  warning: "#E65100",
  warningBg: "rgba(230,81,0,0.08)",
  info: "#1565C0",
  infoBg: "rgba(21,101,192,0.08)",

  // Sidebar
  sidebarWidth: "260px",

  // Shadows
  shadowSm: "0 1px 4px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
  shadowLg: "0 8px 32px rgba(0,0,0,0.10)",
  shadowGold: "0 4px 20px rgba(201,168,76,0.20)",
};

export const ORDER_STATUS = {
  Pendiente: { color: A.warning, bg: A.warningBg, label: "Pendiente" },
  Enviado: { color: A.info, bg: A.infoBg, label: "Enviado" },
  Completado: { color: A.success, bg: A.successBg, label: "Completado" },
};

export const CATEGORIES_LIST = [
  { name: "Anillos", icon: "💍" },
  { name: "Conjuntos", icon: "✨" },
  { name: "Dijes", icon: "🔮" },
  { name: "Herrajes", icon: "⚙️" },
  { name: "Cruceros", icon: "⚓" },
  { name: "Aretes", icon: "🌙" },
  { name: "Cadenas", icon: "🔗" },
  { name: "Pulseras", icon: "💎" },
  { name: "Rosarios", icon: "📿" },
  { name: "Brazaletes Mujer", icon: "🪙" },
  { name: "Brazaletes Hombre", icon: "🪙" },
  { name: "Brazaletes Pareja", icon: "🪙" },
  { name: "Brazaletes Niñas", icon: "🪙" },
  { name: "Brazaletes Niños", icon: "🪙" },
];

// CSS inyectado globalmente para el admin panel
export const adminCSS = `
  /* ─── Admin Base ─── */
  .admin-wrap {
    min-height: 100vh;
    background: ${A.bg};
    color: ${A.textPrimary};
    font-family: 'Jost', sans-serif;
    display: flex;
  }

  /* ─── Sidebar ─── */
  .admin-sidebar {
    width: ${A.sidebarWidth};
    background: ${A.sidebarBg};
    border-right: 1px solid ${A.border};
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 200;
    overflow-y: auto;
    transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s;
    scrollbar-width: none;
  }
  .admin-sidebar::-webkit-scrollbar { display: none; }

  .admin-sidebar-backdrop {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.40);
    backdrop-filter: blur(3px);
    z-index: 199;
    animation: backdropIn 0.25s ease;
  }
  @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }

  /* Mobile sidebar */
  @media (max-width: 768px) {
    .admin-sidebar {
      transform: translateX(-100%);
      box-shadow: none;
    }
    .admin-sidebar.open {
      transform: translateX(0);
      box-shadow: 6px 0 32px rgba(0,0,0,0.18);
    }
    .admin-sidebar-backdrop.open {
      display: block;
    }
  }

  /* ─── Main Content ─── */
  .admin-main {
    flex: 1;
    margin-left: ${A.sidebarWidth};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  @media (max-width: 768px) {
    .admin-main { margin-left: 0; }
  }

  /* ─── Mobile Header ─── */
  .admin-mobile-header {
    display: none;
    position: sticky; top: 0; z-index: 100;
    background: ${A.cardBg};
    border-bottom: 1px solid ${A.border};
    padding: 14px 20px;
    align-items: center;
    justify-content: space-between;
    box-shadow: ${A.shadowSm};
  }
  @media (max-width: 768px) {
    .admin-mobile-header { display: flex; }
  }

  /* ─── Content Area ─── */
  .admin-content {
    flex: 1;
    padding: 36px 40px;
    overflow-y: auto;
  }
  @media (max-width: 1024px) {
    .admin-content { padding: 28px 24px; }
  }
  @media (max-width: 768px) {
    .admin-content { padding: 20px 16px; }
  }

  /* ─── Sidebar Nav Buttons ─── */
  .admin-nav-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 24px;
    background: transparent;
    border: none;
    border-left: 3px solid transparent;
    color: ${A.textSecondary};
    font-size: 14px;
    font-weight: 500;
    font-family: 'Jost', sans-serif;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
    position: relative;
    letter-spacing: 0.2px;
  }
  .admin-nav-btn:hover {
    background: ${A.goldBg};
    color: ${A.goldDark};
    border-left-color: ${A.gold}80;
  }
  .admin-nav-btn.active {
    background: ${A.goldBg};
    color: ${A.goldDark};
    border-left-color: ${A.gold};
    font-weight: 600;
  }
  .admin-nav-btn .nav-icon {
    font-size: 18px;
    width: 22px;
    text-align: center;
    flex-shrink: 0;
  }
  .admin-nav-badge {
    margin-left: auto;
    background: ${A.danger};
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
  }

  /* ─── Metric Cards ─── */
  .admin-metric-card {
    background: ${A.cardBg};
    border: 1px solid ${A.border};
    border-radius: 12px;
    padding: 24px;
    box-shadow: ${A.shadowSm};
    transition: box-shadow 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }
  .admin-metric-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${A.gold}, ${A.goldLight});
    opacity: 0;
    transition: opacity 0.2s;
  }
  .admin-metric-card:hover {
    box-shadow: ${A.shadowMd};
    transform: translateY(-2px);
  }
  .admin-metric-card:hover::before { opacity: 1; }

  /* ─── Category Folder Cards ─── */
  .admin-cat-card {
    background: ${A.cardBg};
    border: 1px solid ${A.border};
    border-radius: 12px;
    padding: 22px;
    cursor: pointer;
    transition: all 0.28s cubic-bezier(0.16,1,0.3,1);
    box-shadow: ${A.shadowSm};
  }
  .admin-cat-card:hover {
    border-color: ${A.gold};
    transform: translateY(-4px);
    box-shadow: ${A.shadowGold};
  }
  .admin-cat-card .cat-icon {
    font-size: 32px;
    display: block;
    margin-bottom: 12px;
    transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
  }
  .admin-cat-card:hover .cat-icon { transform: scale(1.2) rotate(5deg); }

  /* ─── Tables ─── */
  .admin-table-wrap {
    background: ${A.cardBg};
    border: 1px solid ${A.border};
    border-radius: 12px;
    overflow: hidden;
    box-shadow: ${A.shadowSm};
  }
  .admin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    text-align: left;
  }
  .admin-table thead tr {
    background: #F9F7F4;
    border-bottom: 1px solid ${A.border};
  }
  .admin-table th {
    padding: 14px 20px;
    color: ${A.goldDark};
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .admin-table tbody tr {
    border-bottom: 1px solid ${A.border};
    transition: background 0.15s;
  }
  .admin-table tbody tr:last-child { border-bottom: none; }
  .admin-table tbody tr:hover { background: #FDFBF8; }
  .admin-table td { padding: 14px 20px; color: ${A.textPrimary}; }

  /* Mobile: cards instead of table rows */
  @media (max-width: 640px) {
    .admin-table-responsive thead { display: none; }
    .admin-table-responsive tbody tr {
      display: block;
      border: 1px solid ${A.border};
      border-radius: 10px;
      margin-bottom: 12px;
      padding: 14px;
      background: ${A.cardBg};
      box-shadow: ${A.shadowSm};
    }
    .admin-table-responsive td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border: none;
      font-size: 13px;
    }
    .admin-table-responsive td::before {
      content: attr(data-label);
      font-weight: 600;
      color: ${A.textSecondary};
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
      margin-right: 8px;
    }
  }

  /* ─── Admin Input / Form Styles ─── */
  .admin-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid ${A.border};
    border-radius: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    color: ${A.textPrimary};
    background: ${A.cardBg};
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .admin-input:focus {
    border-color: ${A.gold};
    box-shadow: 0 0 0 3px ${A.goldGlow};
  }
  .admin-input::placeholder { color: ${A.textMuted}; }

  .admin-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: ${A.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
  }

  /* ─── Admin Buttons ─── */
  .admin-btn-primary {
    background: linear-gradient(135deg, ${A.gold} 0%, ${A.goldLight} 100%);
    color: #FFF;
    border: none;
    border-radius: 8px;
    padding: 11px 22px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(201,168,76,0.25);
  }
  .admin-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: ${A.shadowGold};
  }
  .admin-btn-primary:active { transform: translateY(0); }

  .admin-btn-secondary {
    background: ${A.cardBg};
    color: ${A.textPrimary};
    border: 1px solid ${A.border};
    border-radius: 8px;
    padding: 10px 20px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .admin-btn-secondary:hover {
    border-color: ${A.gold};
    color: ${A.goldDark};
    background: ${A.goldBg};
  }

  .admin-btn-danger {
    background: transparent;
    color: ${A.danger};
    border: 1px solid ${A.danger}50;
    border-radius: 8px;
    padding: 7px 14px;
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .admin-btn-danger:hover {
    background: ${A.dangerBg};
    border-color: ${A.danger};
  }

  .admin-btn-icon {
    width: 32px; height: 32px;
    background: #F0EDE8;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: bold;
    color: ${A.textPrimary};
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .admin-btn-icon:hover { background: ${A.goldBg}; color: ${A.goldDark}; }

  /* ─── Status Badges ─── */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  /* ─── Section animation ─── */
  .admin-section-in {
    animation: adminSectionIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes adminSectionIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── Chart bar hover tooltip ─── */
  .chart-bar-wrap:hover .chart-tt {
    opacity: 1 !important;
    transform: translateX(-50%) translateY(-2px) !important;
  }

  /* ─── Visibility Toggle ─── */
  .vis-toggle-on {
    background: ${A.successBg};
    color: ${A.success};
    border: 1px solid ${A.success}50;
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .vis-toggle-off {
    background: #F0F0F2;
    color: ${A.textMuted};
    border: 1px solid ${A.border};
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  /* ─── Admin Modal ─── */
  .admin-modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px);
    z-index: 1100;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: backdropIn 0.2s ease;
  }
  .admin-modal {
    background: ${A.cardBg};
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    border: 1px solid ${A.border};
    max-height: 90vh;
    overflow-y: auto;
    animation: modalIn 0.28s cubic-bezier(0.16,1,0.3,1);
    scrollbar-width: thin;
    scrollbar-color: ${A.border} transparent;
  }
  @media (max-width: 640px) {
    .admin-modal-backdrop { align-items: flex-end; padding: 0; }
    .admin-modal {
      border-radius: 20px 20px 0 0;
      max-height: 92vh;
      width: 100%;
    }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ─── Filter Chips ─── */
  .filter-chip {
    padding: 7px 16px;
    border-radius: 20px;
    border: 1px solid ${A.border};
    background: ${A.cardBg};
    color: ${A.textSecondary};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Jost', sans-serif;
    white-space: nowrap;
  }
  .filter-chip.active {
    background: ${A.goldBg};
    border-color: ${A.gold};
    color: ${A.goldDark};
    font-weight: 600;
  }
  .filter-chip:hover:not(.active) { border-color: ${A.gold}60; color: ${A.goldDark}; }

  /* ─── Responsive Grids ─── */
  .admin-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  @media (max-width: 1200px) { .admin-grid-4 { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px)  { .admin-grid-4 { grid-template-columns: 1fr; gap: 14px; } }

  .admin-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 900px) { .admin-grid-2 { grid-template-columns: 1fr; } }

  .admin-grid-cat {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  @media (max-width: 640px) {
    .admin-grid-cat { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }

  /* ─── Logout Button ─── */
  .admin-logout-btn {
    width: 100%;
    padding: 11px;
    background: transparent;
    border: 1px solid ${A.border};
    border-radius: 8px;
    color: ${A.danger};
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }
  .admin-logout-btn:hover {
    background: ${A.dangerBg};
    border-color: ${A.danger};
  }

  /* ─── Scroll Number Input ─── */
  input[type=number].admin-stock-input {
    width: 56px;
    text-align: center;
    padding: 6px 4px;
    border: 1px solid ${A.border};
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    color: ${A.textPrimary};
    background: ${A.cardBg};
    outline: none;
  }
  input[type=number].admin-stock-input:focus {
    border-color: ${A.gold};
    box-shadow: 0 0 0 3px ${A.goldGlow};
  }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { opacity: 0.5; }
`;
