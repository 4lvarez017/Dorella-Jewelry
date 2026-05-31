import { useState, useEffect, useRef } from "react";
import { adminCSS } from "../components/admin/AdminTheme";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminHeader }  from "../components/admin/AdminHeader";
import { DashboardTab } from "../components/admin/DashboardTab";
import { InventarioTab } from "../components/admin/InventarioTab";
import { ProductosTab }  from "../components/admin/ProductosTab";
import { PedidosTab }    from "../components/admin/PedidosTab";
import { supabaseFetch } from "../lib/supabase";
import { useProducts }   from "../context/ProductsContext";
import { MOCK_ORDERS }   from "../data/constants";

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
function getLocalOrders() {
  try { return JSON.parse(localStorage.getItem("dorella_local_orders") || "[]"); }
  catch (_) { return []; }
}
function saveLocalOrders(orders) {
  try { localStorage.setItem("dorella_local_orders", JSON.stringify(orders)); }
  catch (_) {}
}

// ─── Calcular ventas últimos 7 días ───────────────────────────────────────────
function getLast7DaysSales(orders) {
  const salesMap = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    salesMap[key] = {
      label: d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" }),
      total: 0,
    };
  }
  orders.filter((o) => o.status === "Completado").forEach((o) => {
    const key = (o.created_at || "").split("T")[0];
    if (salesMap[key]) salesMap[key].total += o.total || 0;
  });
  return Object.values(salesMap);
}

// ─── Distribución de métodos de pago ─────────────────────────────────────────
function getPaymentStats(orders) {
  const stats = {};
  orders.forEach((o) => {
    const m = o.payment_method || "Efectivo";
    stats[m] = (stats[m] || 0) + 1;
  });
  const total = Object.values(stats).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(stats)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

// ─── Top 3 productos más vendidos ─────────────────────────────────────────────
function getTopProducts(orders) {
  const counts = {};
  orders.filter((o) => o.status === "Completado").forEach((o) => {
    try {
      JSON.parse(o.items || "[]").forEach((item) => {
        counts[item.name] = (counts[item.name] || 0) + item.qty;
      });
    } catch (_) {}
  });
  return Object.entries(counts)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3);
}

// ─── Exportar a CSV ───────────────────────────────────────────────────────────
function exportToCSV(orders) {
  const headers = ["ID", "Cliente", "Teléfono", "Dirección", "Ciudad", "Pago", "Total", "Estado", "Productos"];
  const rows = orders.map((o) => {
    let items = "";
    try { items = JSON.parse(o.items || "[]").map((i) => `${i.name} (x${i.qty})`).join("; "); }
    catch (_) { items = o.items || ""; }
    return [o.id, o.customer_name, o.phone, o.address, o.city, o.payment_method, o.total, o.status, items];
  });
  const csv = "data:text/csv;charset=utf-8,\uFEFF"
    + [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csv));
  link.setAttribute("download", `pedidos_dorella_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function AdminPanel({ activeTab, setActiveTab, onLogout }) {
  const { products, addProduct, updateProduct, deleteProduct, toggleVisibility } = useProducts();

  // Sidebar drawer (móvil)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pedidos
  const [orders, setOrders]                   = useState([]);
  const [loadingOrders, setLoadingOrders]     = useState(true);
  const [supabaseAvailable, setSupabaseAvail] = useState(true);

  // Ref para acción de "nuevo producto" desde el header móvil
  const addProductMobileRef = useRef(null);

  // ── Cargar pedidos ──────────────────────────────────────────────────────────
  async function fetchOrders() {
    setLoadingOrders(true);
    const local = getLocalOrders();
    try {
      const remote = await supabaseFetch("/orders?select=*&order=created_at.desc");
      const remoteIds = new Set(remote.map((o) => o.id));
      const onlyLocal = local.filter((o) => !remoteIds.has(o.id));
      const merged = [...remote, ...onlyLocal].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(merged);
      setSupabaseAvail(true);
    } catch (_) {
      setSupabaseAvail(false);
      if (local.length > 0) {
        setOrders(local.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } else {
        const today = new Date();
        setOrders(
          MOCK_ORDERS.map((o, idx) => {
            const d = new Date(today);
            d.setDate(today.getDate() - idx * 2);
            return { ...o, created_at: d.toISOString(), _isMock: true };
          })
        );
      }
    }
    setLoadingOrders(false);
  }

  useEffect(() => { fetchOrders(); }, []);

  // ── Actualizar estado de pedido ────────────────────────────────────────────
  async function updateOrderStatus(id, status) {
    try {
      await supabaseFetch(`/orders?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (_) {}
    const updated = getLocalOrders().map((o) => (o.id === id ? { ...o, status } : o));
    saveLocalOrders(updated);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  // ── Ayudante para stats por categoría ─────────────────────────────────────
  const getCategoryStats = (name) => {
    const cat = products.filter((p) => (p.category || "").startsWith(name));
    return {
      count:    cat.length,
      stock:    cat.reduce((s, p) => s + (p.stock || 0), 0),
      lowStock: cat.filter((p) => (p.stock || 0) < 5).length,
    };
  };

  // ── Datos calculados para el Dashboard ────────────────────────────────────
  const chartSalesData = getLast7DaysSales(orders);
  const paymentStats   = getPaymentStats(orders);
  const topProducts    = getTopProducts(orders);
  const pendingCount   = orders.filter((o) => o.status === "Pendiente").length;

  // ── Tab change helper ──────────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* CSS del admin panel */}
      <style>{adminCSS}</style>

      <div className="admin-wrap">
        {/* ── Sidebar ── */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={onLogout}
          pendingOrders={pendingCount}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ── Área principal ── */}
        <div className="admin-main">
          {/* Header móvil */}
          <AdminHeader
            activeTab={activeTab}
            onMenuOpen={() => setSidebarOpen(true)}
            onAddProduct={() => addProductMobileRef.current?.()}
            selectedProdCategory={null /* ProductosTab maneja su propio estado */}
          />

          {/* Contenido */}
          <main className="admin-content">
            {/* Título de sección (solo desktop) */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(24px, 3vw, 34px)",
                fontWeight: 600,
                color: "#9A7A2E",
                lineHeight: 1.1,
              }}>
                {activeTab === "dashboard"  && "Dashboard"}
                {activeTab === "inventario" && "Inventario"}
                {activeTab === "productos"  && "Productos"}
                {activeTab === "pedidos"    && "Pedidos"}
              </h1>
              <p style={{ fontSize: 13, color: "#6B6B70", marginTop: 6 }}>
                {activeTab === "dashboard"  && "Resumen en tiempo real de finanzas, ventas y existencias."}
                {activeTab === "inventario" && "Controla el stock de cada categoría de joyería."}
                {activeTab === "productos"  && "Gestiona precios, visibilidad y registro de piezas."}
                {activeTab === "pedidos"    && "Administra y hace seguimiento de todos los pedidos."}
              </p>
            </div>

            {/* Pestañas */}
            {activeTab === "dashboard" && (
              <DashboardTab
                orders={orders}
                products={products}
                chartSalesData={chartSalesData}
                paymentStats={paymentStats}
                topProducts={topProducts}
                onGotoPedidos={() => handleTabChange("pedidos")}
              />
            )}

            {activeTab === "inventario" && (
              <InventarioTab
                products={products}
                updateProduct={updateProduct}
                deleteProduct={deleteProduct}
                getCategoryStats={getCategoryStats}
              />
            )}

            {activeTab === "productos" && (
              <ProductosTab
                products={products}
                updateProduct={updateProduct}
                deleteProduct={deleteProduct}
                toggleVisibility={toggleVisibility}
                addProduct={addProduct}
                getCategoryStats={getCategoryStats}
                onAddProductMobile={addProductMobileRef}
              />
            )}

            {activeTab === "pedidos" && (
              <PedidosTab
                orders={orders}
                loadingOrders={loadingOrders}
                supabaseAvailable={supabaseAvailable}
                onStatusChange={updateOrderStatus}
                onRefresh={fetchOrders}
                onExportCSV={() => exportToCSV(orders)}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
