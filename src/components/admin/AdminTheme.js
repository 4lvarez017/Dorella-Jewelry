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
  goldMid: "#B8973E",
  goldDark: "#9A7A2E",
  goldLight: "#E8C96B",
  goldGlow: "rgba(201,168,76,0.18)",
  goldBg: "rgba(201,168,76,0.07)",

  // Surface
  surfaceBg: "#FDFCFA",

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
  sidebarMiniWidth: "72px",

  // Shadows
  shadowSm: "0 1px 4px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
  shadowLg: "0 8px 32px rgba(0,0,0,0.10)",
  shadowGold: "0 4px 20px rgba(201,168,76,0.20)",
};

export const ORDER_STATUS = {
  Pendiente:  { color: A.warning, bg: A.warningBg, label: "Pendiente"  },
  Enviado:    { color: A.info,    bg: A.infoBg,    label: "Enviado"    },
  Completado: { color: A.success, bg: A.successBg, label: "Completado" },
};

export const CATEGORIES_LIST = [
  { name: "Anillos",           icon: "💍" },
  { name: "Conjuntos",         icon: "✨" },
  { name: "Dijes",             icon: "🔮" },
  { name: "Herrajes",          icon: "⚙️" },
  { name: "Cruceros",          icon: "⚓" },
  { name: "Aretes",            icon: "🌙" },
  { name: "Cadenas",           icon: "🔗" },
  { name: "Pulseras",          icon: "💎" },
  { name: "Rosarios",          icon: "📿" },
  { name: "Tobilleras",        icon: "🦶" },

  { name: "Brazaletes Mujer",  icon: "🪙" },
  { name: "Brazaletes Hombre", icon: "🪙" },
  { name: "Brazaletes Pareja", icon: "🪙" },
  { name: "Brazaletes Niñas",  icon: "🪙" },
  { name: "Brazaletes Niños",  icon: "🪙" },
];

// ─── CSS GLOBAL DEL ADMIN ────────────────────────────────────────────────────
export const adminCSS = `
  /* ─── Base ─── */
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
    overflow-x: hidden;
    transition: transform 0.35s cubic-bezier(0.16,1,0.3,1),
                box-shadow 0.35s,
                width 0.3s cubic-bezier(0.16,1,0.3,1);
    scrollbar-width: none;
  }
  .admin-sidebar::-webkit-scrollbar { display: none; }

  /* ── Tablet mini sidebar (769–1100px) ── */
  @media (min-width: 769px) and (max-width: 1100px) {
    .admin-sidebar { width: ${A.sidebarMiniWidth}; }
    .admin-main    { margin-left: ${A.sidebarMiniWidth} !important; }
    .sidebar-label,
    .sidebar-brand-text,
    .sidebar-user-info,
    .sidebar-logout-label { display: none !important; }
    .admin-nav-btn { justify-content: center; padding: 14px 0; }
    .admin-nav-btn .nav-icon { font-size: 22px; width: auto; margin: 0; }
    .admin-nav-btn:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      background: ${A.textPrimary};
      color: #fff;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      z-index: 300;
      box-shadow: ${A.shadowMd};
    }
    .admin-nav-btn { position: relative; }
    .sidebar-logo-wrap { justify-content: center; padding: 20px 0; }
    .sidebar-logo-icon { margin: 0 auto; }
    .sidebar-footer { padding: 12px 0; }
    .sidebar-user-avatar { margin: 0 auto; }
  }

  /* Sidebar backdrop (móvil) */
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
      width: ${A.sidebarWidth} !important;
    }
    .admin-sidebar.open {
      transform: translateX(0);
      box-shadow: 6px 0 32px rgba(0,0,0,0.18);
    }
    .admin-sidebar-backdrop.open { display: block; }
    .sidebar-label { display: inline !important; }
    .sidebar-brand-text { display: block !important; }
    .sidebar-user-info { display: block !important; }
  }

  /* ─── Main Content ─── */
  .admin-main {
    flex: 1;
    margin-left: ${A.sidebarWidth};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    min-width: 0;
    transition: margin-left 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  @media (max-width: 768px) {
    .admin-main { margin-left: 0 !important; }
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

  /* ─── Hamburger animado ─── */
  .admin-hamburger {
    background: none; border: none; cursor: pointer;
    padding: 4px; display: flex; flex-direction: column;
    gap: 5px; position: relative;
  }
  .admin-hamburger span {
    display: block; height: 2px; background: ${A.textPrimary};
    border-radius: 2px;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                opacity 0.3s, width 0.3s;
  }
  .admin-hamburger span:nth-child(1) { width: 24px; }
  .admin-hamburger span:nth-child(2) { width: 18px; }
  .admin-hamburger span:nth-child(3) { width: 24px; }
  .admin-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); width: 24px; }
  .admin-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .admin-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); width: 24px; }

  /* ─── Content Area ─── */
  .admin-content {
    flex: 1;
    padding: 36px 40px;
    overflow-y: auto;
  }
  @media (max-width: 1024px) { .admin-content { padding: 28px 24px; } }
  @media (max-width: 768px)  { .admin-content { padding: 20px 16px; } }

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
    font-size: 18px; width: 22px;
    text-align: center; flex-shrink: 0;
  }
  .admin-nav-badge {
    margin-left: auto;
    background: ${A.danger};
    color: #fff;
    font-size: 10px; font-weight: 700;
    min-width: 18px; height: 18px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    padding: 0 5px;
    animation: pulseBadge 2s infinite;
  }
  @keyframes pulseBadge {
    0%, 100% { box-shadow: 0 0 0 0 rgba(229,57,53,0.4); }
    50%       { box-shadow: 0 0 0 5px rgba(229,57,53,0); }
  }

  /* ─── Metric Cards ─── */
  .admin-metric-card {
    background: ${A.cardBg};
    border: 1px solid ${A.border};
    border-radius: 14px;
    padding: 24px;
    box-shadow: ${A.shadowSm};
    transition: box-shadow 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }
  .admin-metric-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${A.gold}, ${A.goldLight});
    opacity: 0; transition: opacity 0.2s;
  }
  .admin-metric-card:hover {
    box-shadow: ${A.shadowMd};
    transform: translateY(-2px);
  }
  .admin-metric-card:hover::before { opacity: 1; }

  /* ─── Product Card Grid ─── */
  .prod-card-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
  @media (max-width: 1300px) { .prod-card-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 900px)  { .prod-card-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
  @media (max-width: 480px)  { .prod-card-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

  /* ─── Product Card ─── */
  .prod-card {
    background: ${A.cardBg};
    border: 1px solid ${A.border};
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.28s cubic-bezier(0.16,1,0.3,1);
    box-shadow: ${A.shadowSm};
    position: relative;
  }
  .prod-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.13);
    border-color: ${A.gold}50;
  }
  .prod-card-img-wrap {
    position: relative;
    overflow: hidden;
    aspect-ratio: 1;
    background: ${A.bg};
  }
  .prod-card-img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
    display: block;
  }
  .prod-card:hover .prod-card-img { transform: scale(1.06); }
  .prod-card-body {
    padding: 14px 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }
  @media (max-width: 480px) {
    .prod-card-body { padding: 10px 10px 10px; gap: 6px; }
  }

  /* ─── Category Folder Cards ─── */
  .admin-cat-card {
    background: ${A.cardBg};
    border: 1px solid ${A.border};
    border-radius: 14px;
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
    font-size: 32px; display: block; margin-bottom: 12px;
    transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
  }
  .admin-cat-card:hover .cat-icon { transform: scale(1.2) rotate(5deg); }

  /* ─── Tables ─── */
  .admin-table-wrap {
    background: ${A.cardBg};
    border: 1px solid ${A.border};
    border-radius: 14px;
    overflow: hidden;
    box-shadow: ${A.shadowSm};
  }
  .admin-table {
    width: 100%; border-collapse: collapse;
    font-size: 14px; text-align: left;
  }
  .admin-table thead tr {
    background: #F9F7F4;
    border-bottom: 1px solid ${A.border};
  }
  .admin-table th {
    padding: 14px 20px;
    color: ${A.goldDark};
    font-weight: 600; font-size: 12px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .admin-table tbody tr {
    border-bottom: 1px solid ${A.border};
    transition: background 0.15s;
  }
  .admin-table tbody tr:last-child { border-bottom: none; }
  .admin-table tbody tr:hover { background: #FDFBF8; }
  .admin-table td { padding: 14px 20px; color: ${A.textPrimary}; }

  /* Mobile: table → card rows */
  @media (max-width: 640px) {
    .admin-table-responsive thead { display: none; }
    .admin-table-responsive tbody tr {
      display: block;
      border: 1px solid ${A.border};
      border-radius: 12px;
      margin-bottom: 12px;
      padding: 14px;
      background: ${A.cardBg};
      box-shadow: ${A.shadowSm};
    }
    .admin-table-responsive td {
      display: flex;
      justify-content: space-between; align-items: center;
      padding: 6px 0; border: none; font-size: 13px;
    }
    .admin-table-responsive td::before {
      content: attr(data-label);
      font-weight: 600; color: ${A.textSecondary};
      font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.5px; flex-shrink: 0; margin-right: 8px;
    }
  }

  /* ─── Inputs ─── */
  .admin-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid ${A.border};
    border-radius: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 14px; color: ${A.textPrimary};
    background: ${A.cardBg};
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    box-sizing: border-box;
  }
  .admin-input:focus {
    border-color: ${A.gold};
    box-shadow: 0 0 0 3px ${A.goldGlow};
  }
  .admin-input::placeholder { color: ${A.textMuted}; }

  .admin-label {
    display: block; font-size: 11px; font-weight: 600;
    color: ${A.textSecondary}; text-transform: uppercase;
    letter-spacing: 0.8px; margin-bottom: 6px;
  }

  /* ─── Buttons ─── */
  .admin-btn-primary {
    background: linear-gradient(135deg, ${A.gold} 0%, ${A.goldLight} 100%);
    color: #FFF; border: none; border-radius: 8px;
    padding: 11px 22px;
    font-family: 'Jost', sans-serif; font-size: 13px;
    font-weight: 600; letter-spacing: 0.3px;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(201,168,76,0.25);
  }
  .admin-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: ${A.shadowGold};
  }
  .admin-btn-primary:active { transform: translateY(0); }

  .admin-btn-secondary {
    background: ${A.cardBg}; color: ${A.textPrimary};
    border: 1px solid ${A.border}; border-radius: 8px;
    padding: 10px 20px;
    font-family: 'Jost', sans-serif; font-size: 13px;
    font-weight: 500; cursor: pointer; transition: all 0.2s;
  }
  .admin-btn-secondary:hover {
    border-color: ${A.gold}; color: ${A.goldDark};
    background: ${A.goldBg};
  }

  .admin-btn-danger {
    background: transparent; color: ${A.danger};
    border: 1px solid ${A.danger}50; border-radius: 8px;
    padding: 7px 14px;
    font-family: 'Jost', sans-serif; font-size: 12px;
    font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .admin-btn-danger:hover {
    background: ${A.dangerBg}; border-color: ${A.danger};
  }

  .admin-btn-icon {
    width: 32px; height: 32px;
    background: #F0EDE8; border: none; border-radius: 6px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: bold; color: ${A.textPrimary};
    transition: background 0.2s; flex-shrink: 0;
  }
  .admin-btn-icon:hover { background: ${A.goldBg}; color: ${A.goldDark}; }

  /* ─── Status Badges ─── */
  .status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 12px; font-weight: 600; white-space: nowrap;
  }

  /* ─── Section animation ─── */
  .admin-section-in {
    animation: adminSectionIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes adminSectionIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── Stagger animation ─── */
  .admin-stagger > * {
    animation: cardStaggerIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }
  .admin-stagger > *:nth-child(1)  { animation-delay: 0.04s; }
  .admin-stagger > *:nth-child(2)  { animation-delay: 0.08s; }
  .admin-stagger > *:nth-child(3)  { animation-delay: 0.12s; }
  .admin-stagger > *:nth-child(4)  { animation-delay: 0.16s; }
  .admin-stagger > *:nth-child(5)  { animation-delay: 0.20s; }
  .admin-stagger > *:nth-child(6)  { animation-delay: 0.23s; }
  .admin-stagger > *:nth-child(7)  { animation-delay: 0.26s; }
  .admin-stagger > *:nth-child(8)  { animation-delay: 0.29s; }
  .admin-stagger > *:nth-child(n+9){ animation-delay: 0.32s; }
  @keyframes cardStaggerIn {
    from { opacity: 0; transform: translateY(18px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ─── Skeleton Loaders ─── */
  .admin-skeleton {
    background: linear-gradient(90deg, #F0EDE8 25%, #E8E4DE 50%, #F0EDE8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ─── Toast Notifications ─── */
  .admin-toast-container {
    position: fixed; bottom: 24px; right: 24px;
    z-index: 9999;
    display: flex; flex-direction: column; gap: 10px;
    pointer-events: none;
  }
  @media (max-width: 480px) {
    .admin-toast-container { bottom: 16px; right: 16px; left: 16px; }
  }
  .admin-toast {
    padding: 13px 18px;
    border-radius: 12px;
    font-size: 13px; font-weight: 600;
    font-family: 'Jost', sans-serif;
    box-shadow: 0 8px 28px rgba(0,0,0,0.18);
    animation: toastIn 0.35s cubic-bezier(0.16,1,0.3,1);
    pointer-events: auto;
    max-width: 340px;
    display: flex; align-items: center; gap: 10px;
    backdrop-filter: blur(8px);
  }
  .admin-toast-success {
    background: #1A1A1A;
    color: #fff;
    border-left: 3px solid ${A.gold};
  }
  .admin-toast-error {
    background: #1A1A1A;
    color: #fff;
    border-left: 3px solid ${A.danger};
  }
  .admin-toast-info {
    background: #1A1A1A;
    color: #fff;
    border-left: 3px solid ${A.info};
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateY(14px) scale(0.94); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ─── Confirm Dialog ─── */
  .admin-confirm-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(5px);
    z-index: 3000;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: backdropIn 0.2s ease;
  }
  .admin-confirm-box {
    background: ${A.cardBg};
    border-radius: 20px;
    padding: 36px 32px 28px;
    max-width: 380px; width: 100%;
    box-shadow: 0 24px 64px rgba(0,0,0,0.22);
    border: 1px solid ${A.border};
    animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1);
    text-align: center;
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
    border-radius: 18px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    border: 1px solid ${A.border};
    max-height: 90vh; overflow-y: auto;
    animation: modalIn 0.28s cubic-bezier(0.16,1,0.3,1);
    scrollbar-width: thin;
    scrollbar-color: ${A.border} transparent;
  }
  @media (max-width: 640px) {
    .admin-modal-backdrop { align-items: flex-end; padding: 0; }
    .admin-modal {
      border-radius: 20px 20px 0 0;
      max-height: 93vh; width: 100%;
    }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ─── Filter Chips ─── */
  .filter-chip {
    padding: 7px 14px; border-radius: 20px;
    border: 1px solid ${A.border};
    background: ${A.cardBg}; color: ${A.textSecondary};
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s;
    font-family: 'Jost', sans-serif; white-space: nowrap;
    flex-shrink: 0;
  }
  .filter-chip.active {
    background: ${A.goldBg};
    border-color: ${A.gold};
    color: ${A.goldDark}; font-weight: 600;
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

  .admin-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  @media (max-width: 900px) { .admin-grid-3 { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 500px) { .admin-grid-3 { grid-template-columns: 1fr; } }

  .admin-grid-cat {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 16px;
  }
  @media (max-width: 640px) {
    .admin-grid-cat { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }

  /* ─── Chart bar hover tooltip ─── */
  .chart-bar-wrap:hover .chart-tt {
    opacity: 1 !important;
    transform: translateX(-50%) translateY(-2px) !important;
  }

  /* ─── Visibility Toggle ─── */
  .vis-toggle-on {
    background: ${A.successBg}; color: ${A.success};
    border: 1px solid ${A.success}50; border-radius: 20px;
    padding: 5px 12px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .vis-toggle-off {
    background: #F0F0F2; color: ${A.textMuted};
    border: 1px solid ${A.border}; border-radius: 20px;
    padding: 5px 12px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }

  /* ─── Logout Button ─── */
  .admin-logout-btn {
    width: 100%; padding: 11px;
    background: transparent;
    border: 1px solid ${A.border};
    border-radius: 8px; color: ${A.danger};
    font-family: 'Jost', sans-serif; font-size: 13px;
    font-weight: 600; cursor: pointer; transition: all 0.2s;
    letter-spacing: 0.5px;
  }
  .admin-logout-btn:hover {
    background: ${A.dangerBg};
    border-color: ${A.danger};
  }

  /* ─── Stock number input ─── */
  input[type=number].admin-stock-input {
    width: 56px; text-align: center; padding: 6px 4px;
    border: 1px solid ${A.border}; border-radius: 6px;
    font-weight: 600; font-size: 14px;
    color: ${A.textPrimary}; background: ${A.cardBg};
    outline: none;
  }
  input[type=number].admin-stock-input:focus {
    border-color: ${A.gold};
    box-shadow: 0 0 0 3px ${A.goldGlow};
  }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { opacity: 0.5; }

  /* ─── Stock Progress Bar ─── */
  .stock-bar-track {
    height: 5px; background: ${A.border};
    border-radius: 3px; overflow: hidden; margin-top: 6px;
  }
  .stock-bar-fill {
    height: 100%; border-radius: 3px;
    transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
  }

  /* ─── Image Preview ─── */
  .img-preview-box {
    border: 2px dashed ${A.border}; border-radius: 10px;
    overflow: hidden; transition: border-color 0.2s;
    aspect-ratio: 1; background: ${A.bg};
    display: flex; align-items: center; justify-content: center;
  }
  .img-preview-box.has-img { border-color: ${A.gold}50; border-style: solid; }
  .img-preview-box img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* ─── Inline validation error ─── */
  .field-error {
    font-size: 11px; color: ${A.danger};
    margin-top: 5px; font-weight: 500;
    animation: adminSectionIn 0.2s ease;
  }

  /* ─── Order timeline ─── */
  .order-timeline {
    display: flex; align-items: center; gap: 0;
    font-size: 11px; font-weight: 600;
    margin-top: 8px;
  }
  .order-timeline-step {
    display: flex; flex-direction: column; align-items: center;
    flex: 1; text-align: center; gap: 4px;
  }
  .order-timeline-dot {
    width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; transition: all 0.3s;
  }
  .order-timeline-line {
    flex: 1; height: 2px; margin: 0 -1px;
    align-self: center; margin-top: -12px;
    position: relative; z-index: 0;
  }

  /* ─── Trend indicator ─── */
  .trend-up   { color: ${A.success}; font-size: 11px; font-weight: 700; }
  .trend-down { color: ${A.danger};  font-size: 11px; font-weight: 700; }
  .trend-flat { color: ${A.textMuted}; font-size: 11px; font-weight: 600; }
`;
