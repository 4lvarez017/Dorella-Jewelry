// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const G = {
  gold: "#C9A84C",
  goldLight: "#E8C96B",
  goldDark: "#9A7A2E",
  black: "#0A0909",
  carbon: "#121110",
  charcoal: "#1A1918",
  white: "#1D1B1A", // Map G.white to a luxury card dark color
  cream: "#141312", // Map G.cream to the main luxury dark background
  creamDark: "#2A2724", // Map G.creamDark to dark gold-tinted borders
  rose: "#1F1A1B", // Soft dark rose tint
  roseAccent: "#E8C4CC", // Pastel rose
  textDark: "#ECE7DF", // Map G.textDark to a warm champagne cream text
  textMid: "#CFC9BF", // Map G.textMid to a secondary warm champagne text
  textMuted: "#948E85", // Map G.textMuted to a muted silver-gold
  pastelGold: "#E8D090",
  pastelRose: "#E8C4CC",
  pastelCream: "#F5EBE6",
};

// ─── GLOBAL CSS (inyectado en <style> en App.jsx) ─────────────────────────────
export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    font-family: 'Jost', sans-serif;
    background: ${G.cream};
    color: ${G.textDark};
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${G.black}; }
  ::-webkit-scrollbar-thumb { background: ${G.gold}; border-radius: 2px; }

  .serif { font-family: 'Cormorant Garamond', serif; }
  .gold-text { color: ${G.gold}; }

  /* ── Buttons ── */
  .gold-btn {
    background: linear-gradient(135deg, ${G.gold} 0%, ${G.goldLight} 50%, ${G.gold} 100%);
    background-size: 200% auto;
    color: ${G.black};
    border: none;
    padding: 14px 32px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-position 0.4s, transform 0.2s, box-shadow 0.2s;
    border-radius: 1px;
  }
  .gold-btn:hover {
    background-position: right center;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(201,168,76,0.3);
  }
  .gold-btn:active { transform: translateY(0); }
  .gold-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .gold-outline-btn {
    background: transparent;
    color: ${G.gold};
    border: 1px solid ${G.gold};
    padding: 10px 24px;
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 1px;
  }
  .gold-outline-btn:hover {
    background: ${G.gold};
    color: ${G.black};
    box-shadow: 0 4px 15px rgba(201,168,76,0.2);
  }

  /* ── Animations ── */
  .fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Decorative ── */
  .gold-separator {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${G.gold}, transparent);
    margin: 16px auto;
  }

  .section-label {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: ${G.gold};
    font-weight: 500;
  }

  .tag {
    display: inline-block;
    padding: 3px 10px;
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 600;
    background: rgba(201,168,76,0.1);
    color: ${G.goldLight};
    border: 1px solid rgba(201,168,76,0.3);
  }

  /* ── Product grids & cards ── */
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .product-card {
    background: ${G.white};
    border: 1px solid ${G.creamDark};
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    position: relative;
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(201,168,76,0.15);
  }
  .product-card img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    transition: transform 0.5s;
    display: block;
  }
  .product-card:hover img { transform: scale(1.05); }

  .dark-product-card {
    background: ${G.black};
    border: 1px solid rgba(201,168,76,0.2);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s, border-color 0.3s;
    position: relative;
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .dark-product-card:hover {
    transform: translateY(-4px);
    border-color: ${G.gold};
  }
  .dark-product-card img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    transition: transform 0.5s;
    display: block;
  }
  .dark-product-card:hover img { transform: scale(1.05); }

  .overlay-add {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .product-card:hover .overlay-add,
  .dark-product-card:hover .overlay-add { opacity: 1; }


  /* ── Sidebar (Global Drawer) ── */
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    background: ${G.white};
    border-right: 1px solid ${G.creamDark};
    z-index: 10000;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .sidebar.open {
    transform: translateX(0);
    box-shadow: 4px 0 30px rgba(0, 0, 0, 0.15);
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    color: ${G.textMid};
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 1px;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
    border-left: 3px solid transparent;
    text-transform: uppercase;
  }
  .sidebar-link:hover, .sidebar-link.active {
    color: ${G.gold};
    background: rgba(201,168,76,0.05);
    border-left-color: ${G.gold};
  }

  .sidebar-sublink {
    padding: 8px 24px 8px 52px;
    font-size: 12px;
    color: ${G.textMuted};
    cursor: pointer;
    transition: color 0.2s;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .sidebar-sublink:hover { color: ${G.gold}; }

  /* ── Navigation Header (Sticky/Glassmorphic) ── */
  .glass-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 990;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 40px;
    transition: background 0.3s, padding 0.3s, box-shadow 0.3s;
    font-family: 'Jost', sans-serif;
  }
  .glass-header.scrolled {
    background: rgba(20, 19, 18, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
    padding: 12px 40px;
    border-bottom: 1px solid ${G.creamDark};
  }
  .glass-header.scrolled .nav-logo {
    color: ${G.textDark} !important;
  }
  .glass-header.scrolled .nav-item {
    color: ${G.textMid} !important;
  }

  .nav-item {
    color: ${G.textMid};
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    transition: color 0.2s;
    cursor: pointer;
  }
  .nav-item:hover {
    color: ${G.goldLight};
  }
  .glass-header.scrolled .nav-item:hover {
    color: ${G.gold};
  }

  .nav-cta {
    background: linear-gradient(135deg, ${G.gold} 0%, ${G.goldLight} 50%, ${G.gold} 100%);
    color: ${G.black};
    border: none;
    padding: 8px 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
  }
  .nav-cta:hover {
    opacity: 0.95;
    transform: translateY(-1px);
  }

  /* ── Modals ── */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal {
    background: ${G.white};
    max-width: 520px; width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    border-top: 3px solid ${G.gold};
  }

  /* ── FABs ── */
  .whatsapp-fab {
    position: fixed;
    bottom: 28px; right: 28px;
    width: 56px; height: 56px;
    background: #25D366;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(37,211,102,0.4);
    animation: pulseGreen 2.5s infinite;
    border: none;
    transition: transform 0.2s;
  }
  .whatsapp-fab:hover { transform: scale(1.1); }

  .cart-fab {
    position: fixed;
    bottom: 28px; right: 96px;
    width: 56px; height: 56px;
    background: ${G.gold};
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(201,168,76,0.4);
    border: none;
    transition: transform 0.2s;
    color: ${G.black};
    font-size: 22px;
  }
  .cart-fab:hover { transform: scale(1.1); }

  .cart-badge {
    position: absolute;
    top: -4px; right: -4px;
    background: #e74c3c;
    color: white;
    font-size: 10px;
    font-weight: 700;
    width: 18px; height: 18px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Form elements ── */
  input, select, textarea {
    font-family: 'Jost', sans-serif;
    font-size: 14px;
  }
  input:focus, select:focus, textarea:focus {
    outline: 1px solid ${G.gold};
  }

  /* ── Keyframes ── */
  @keyframes heroZoom {
    from { transform: scale(1.1); }
    to { transform: scale(1); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes pulseGreen {
    0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.4); }
    50% { box-shadow: 0 4px 20px rgba(37,211,102,0.4), 0 0 0 8px rgba(37,211,102,0); }
  }

  /* ── Hero animation classes ── */
  .hero-img { animation: heroZoom 8s ease-out forwards; }
  .hero-title { animation: fadeSlideUp 1s ease forwards 0.3s; opacity: 0; }
  .hero-sub { animation: fadeSlideUp 1s ease forwards 0.6s; opacity: 0; }
  .hero-cta { animation: fadeSlideUp 1s ease forwards 0.9s; opacity: 0; }

  /* ── Premium hover for images ── */
  .premium-img-container {
    overflow: hidden;
    position: relative;
    border-radius: 2px;
  }
  .premium-img-container img {
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .premium-img-container:hover img {
    transform: scale(1.06);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .glass-header { padding: 12px 20px; }
    .glass-header.scrolled { padding: 10px 20px; }
    .nav-links-desktop { display: none !important; }
    .main-content { margin-left: 0 !important; }
    .brand-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
  }

  @media (max-width: 600px) {
    .product-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px !important;
    }
    .product-card, .dark-product-card {
      max-width: 100% !important;
    }
    .product-card .tag,
    .dark-product-card .tag {
      font-size: 8px !important;
      padding: 1px 6px !important;
    }
    .product-card .serif,
    .dark-product-card .serif {
      font-size: 14px !important;
      margin-top: 4px !important;
      line-height: 1.2 !important;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .product-desc {
      display: none !important;
    }
    .overlay-add {
      display: none !important;
    }
    /* Controlar el padding de la sección de texto de las tarjetas */
    .product-card > div:last-child,
    .dark-product-card > div:last-child {
      padding: 10px !important;
    }
  }
`;

