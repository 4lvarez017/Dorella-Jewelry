import { useState, useEffect, useRef } from "react";
import { adminCSS, A } from "../components/admin/AdminTheme";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminHeader }  from "../components/admin/AdminHeader";
import { DashboardTab } from "../components/admin/DashboardTab";
import { InventarioTab } from "../components/admin/InventarioTab";
import { ProductosTab }  from "../components/admin/ProductosTab";
import { PedidosTab }    from "../components/admin/PedidosTab";
import { supabaseFetch } from "../lib/supabase";
import { useProducts }   from "../context/ProductsContext";
import { MOCK_ORDERS }   from "../data/constants";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
function getLocalOrders() {
  try { return JSON.parse(localStorage.getItem("dorella_local_orders") || "[]"); }
  catch (_) { return []; }
}
function saveLocalOrders(orders) {
  try { localStorage.setItem("dorella_local_orders", JSON.stringify(orders)); }
  catch (_) {}
}

// ─── Ventas últimos 7 días ────────────────────────────────────────────────────
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
  orders.filter(o => o.status === "Completado").forEach(o => {
    const key = (o.created_at || "").split("T")[0];
    if (salesMap[key]) salesMap[key].total += o.total || 0;
  });
  return Object.values(salesMap);
}

// ─── Métodos de pago ──────────────────────────────────────────────────────────
function getPaymentStats(orders) {
  const stats = {};
  orders.forEach(o => {
    const m = o.payment_method || "Efectivo";
    stats[m] = (stats[m] || 0) + 1;
  });
  const total = Object.values(stats).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(stats)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

// ─── Top productos vendidos ───────────────────────────────────────────────────
function getTopProducts(orders) {
  const counts = {};
  orders.filter(o => o.status === "Completado").forEach(o => {
    try {
      JSON.parse(o.items || "[]").forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.qty;
      });
    } catch (_) {}
  });
  return Object.entries(counts)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3);
}

// ─── Exportar Excel ──────────────────────────────────────────────────────────
function exportToExcel(orders) {
  const headers = ["ID Pedido", "Fecha", "Cliente", "Teléfono", "Dirección", "Ciudad", "Método Pago", "Total", "Estado", "Detalle Productos"];
  
  const titleRows = [
    ["👑 DORELLA JEWELRY - PANEL DE CONTROL"],
    ["REPORTE OFICIAL DE PEDIDOS E INGRESOS"],
    [`Fecha de generación: ${new Date().toLocaleString("es-CO")}`],
    [], // Fila vacía de separación
    headers
  ];

  const dataRows = orders.map(o => {
    let itemsStr;
    try {
      itemsStr = JSON.parse(o.items || "[]")
        .map(i => `${i.name} (x${i.qty})`)
        .join("; ");
    } catch (_) {
      itemsStr = o.items || "";
    }
    const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString("es-CO") : "—";
    return [
      o.id,
      dateStr,
      o.customer_name,
      o.phone,
      o.address,
      o.city,
      o.payment_method,
      Number(o.total || 0),
      o.status,
      itemsStr
    ];
  });

  const allRows = [...titleRows, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Formatear columna de Total como moneda (COP)
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
  for (let r = 5; r <= range.e.r; r++) {
    const cellRef = XLSX.utils.encode_cell({ r, c: 7 }); // Columna H (Total) es index 7
    if (ws[cellRef]) {
      ws[cellRef].t = "n";
      ws[cellRef].z = '"$"#,##0';
    }
  }

  // Configurar anchos de columna para evitar truncamientos
  ws["!cols"] = [
    { wch: 18 }, // ID Pedido
    { wch: 12 }, // Fecha
    { wch: 25 }, // Cliente
    { wch: 15 }, // Teléfono
    { wch: 30 }, // Dirección
    { wch: 15 }, // Ciudad
    { wch: 18 }, // Método Pago
    { wch: 15 }, // Total
    { wch: 12 }, // Estado
    { wch: 50 }, // Detalle Productos
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pedidos Dorella");
  XLSX.writeFile(wb, `pedidos_dorella_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ─── Exportar PDF ─────────────────────────────────────────────────────────────
function exportToPDF(orders) {
  const doc = new jsPDF("landscape", "mm", "a4"); // Formato horizontal para más espacio

  // Encabezado de la joyería
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(154, 122, 46); // Color dorado oscuro
  doc.text("👑 DORELLA JEWELRY", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 107, 112);
  doc.text("Reporte Oficial de Ventas y Pedidos - Sistema Administrativo", 14, 26);
  doc.text(`Generado el: ${new Date().toLocaleString("es-CO")}`, 14, 31);

  // Línea dorada divisoria
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.8);
  doc.line(14, 35, 283, 35); // A4 horizontal tiene 297mm de ancho

  // Columnas y Filas para el PDF
  const tableColumn = ["ID Pedido", "Fecha", "Cliente", "Teléfono", "Ciudad", "Método Pago", "Total", "Estado", "Productos"];
  const tableRows = orders.map(o => {
    let itemsStr;
    try {
      itemsStr = JSON.parse(o.items || "[]")
        .map(i => `${i.name} (x${i.qty})`)
        .join(", ");
    } catch (_) {
      itemsStr = o.items || "";
    }
    const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString("es-CO") : "—";
    
    // Si el ID es un UUID largo, lo truncamos ligeramente para que entre en la tabla
    const shortId = (o.id || "").length > 15 ? (o.id.substring(0, 10) + "...") : o.id;

    return [
      shortId,
      dateStr,
      o.customer_name,
      o.phone || "—",
      o.city || "—",
      o.payment_method,
      `$${(o.total || 0).toLocaleString("es-CO")}`,
      o.status,
      itemsStr
    ];
  });

  // Generar tabla elegante con jspdf-autotable
  doc.autoTable({
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [154, 122, 46], // Fondo dorado
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "left"
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [29, 29, 31],
      valign: "middle"
    },
    columnStyles: {
      0: { cellWidth: 24 }, // ID
      1: { cellWidth: 20 }, // Fecha
      2: { cellWidth: 32 }, // Cliente
      3: { cellWidth: 22 }, // Teléfono
      4: { cellWidth: 22 }, // Ciudad
      5: { cellWidth: 24 }, // Pago
      6: { cellWidth: 22, halign: "right", fontStyle: "bold" }, // Total
      7: { cellWidth: 22 }, // Estado
      8: { cellWidth: "auto" } // Productos
    },
    styles: {
      overflow: "linebreak",
      cellPadding: 3
    },
    didDrawPage: (data) => {
      // Pie de página
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 168);
      doc.text(`Página ${data.pageNumber}`, 14, doc.internal.pageSize.height - 10);
      doc.text("Dorella Jewelry - Todos los derechos reservados ©", doc.internal.pageSize.width - 90, doc.internal.pageSize.height - 10);
    }
  });

  doc.save(`pedidos_dorella_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function AdminPanel({ activeTab, setActiveTab, onLogout }) {
  const { products, addProduct, updateProduct, deleteProduct, toggleVisibility } = useProducts();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders]           = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [supabaseAvailable, setSupabaseAvail] = useState(true);
  const addProductMobileRef = useRef(null);

  // ── Toast system ────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  };

  // ── Confirm modal ───────────────────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState(null);
  const showConfirm = (message, onConfirm) => setConfirmModal({ message, onConfirm });

  // ── Cargar pedidos ──────────────────────────────────────────────────────────
  async function fetchOrders() {
    setLoadingOrders(true);
    const local = getLocalOrders();
    try {
      const remote = await supabaseFetch("/orders?select=*&order=created_at.desc");
      const remoteIds = new Set(remote.map(o => o.id));
      const onlyLocal = local.filter(o => !remoteIds.has(o.id));
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
        setOrders(MOCK_ORDERS.map((o, idx) => {
          const d = new Date(today);
          d.setDate(today.getDate() - idx * 2);
          return { ...o, created_at: d.toISOString(), _isMock: true };
        }));
      }
    }
    setLoadingOrders(false);
  }

  useEffect(() => { fetchOrders(); }, []);

  // ── Actualizar estado de pedido ─────────────────────────────────────────────
  async function updateOrderStatus(id, status) {
    try {
      await supabaseFetch(`/orders?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (_) {}
    const updated = getLocalOrders().map(o => o.id === id ? { ...o, status } : o);
    saveLocalOrders(updated);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    addToast(`Estado → ${status} ✓`);
  }

  // ── Eliminar pedido ─────────────────────────────────────────────────────────
  async function deleteOrder(id) {
    try {
      await supabaseFetch(`/orders?id=eq.${id}`, { method: "DELETE" });
    } catch (_) {}
    const updated = getLocalOrders().filter(o => o.id !== id);
    saveLocalOrders(updated);
    setOrders(prev => prev.filter(o => o.id !== id));
    addToast("Pedido eliminado", "error");
  }

  // ── Stats por categoría ─────────────────────────────────────────────────────
  const getCategoryStats = name => {
    const cat = products.filter(p => (p.category || "").startsWith(name));
    return {
      count:    cat.length,
      stock:    cat.reduce((s, p) => s + (p.stock || 0), 0),
      lowStock: cat.filter(p => (p.stock || 0) < 5).length,
    };
  };

  // ── Dashboard data ──────────────────────────────────────────────────────────
  const chartSalesData = getLast7DaysSales(orders);
  const paymentStats   = getPaymentStats(orders);
  const topProducts    = getTopProducts(orders);
  const pendingCount   = orders.filter(o => o.status === "Pendiente").length;

  // ── Tab change ──────────────────────────────────────────────────────────────
  const handleTabChange = tab => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <>
      <style>{adminCSS}</style>

      <div className="admin-wrap">
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={onLogout}
          pendingOrders={pendingCount}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Área principal */}
        <div className="admin-main">
          <AdminHeader
            activeTab={activeTab}
            onMenuOpen={() => setSidebarOpen(true)}
            isOpen={sidebarOpen}
            pendingOrders={pendingCount}
            onAddProduct={() => addProductMobileRef.current?.()}
          />

          <main className="admin-content">
            {/* Título + subtítulo */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(24px, 3vw, 34px)",
                fontWeight: 600, color: A.goldDark, lineHeight: 1.1,
              }}>
                {activeTab === "dashboard"  && "Dashboard"}
                {activeTab === "inventario" && "Inventario"}
                {activeTab === "productos"  && "Productos"}
                {activeTab === "pedidos"    && "Pedidos"}
              </h1>
              <p style={{ fontSize: 13, color: A.textSecondary, marginTop: 6 }}>
                {activeTab === "dashboard"  && "Resumen en tiempo real de finanzas, ventas y existencias."}
                {activeTab === "inventario" && "Controla el stock de cada categoría de joyería."}
                {activeTab === "productos"  && "Gestiona precios, visibilidad y registro de piezas."}
                {activeTab === "pedidos"    && "Administra y hace seguimiento de todos los pedidos."}
              </p>
            </div>

            {/* ── Tabs ── */}
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
                addToast={addToast}
                showConfirm={showConfirm}
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
                onAddProductMobileRef={addProductMobileRef}
                addToast={addToast}
                showConfirm={showConfirm}
              />
            )}

            {activeTab === "pedidos" && (
              <PedidosTab
                orders={orders}
                loadingOrders={loadingOrders}
                supabaseAvailable={supabaseAvailable}
                onStatusChange={updateOrderStatus}
                onRefresh={fetchOrders}
                onExportPDF={() => exportToPDF(orders)}
                onExportExcel={() => exportToExcel(orders)}
                onDeleteOrder={deleteOrder}
                showConfirm={showConfirm}
              />
            )}
          </main>
        </div>
      </div>

      {/* ── Toast container ── */}
      <div className="admin-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`admin-toast admin-toast-${t.type}`}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>
              {t.type === "success" && "✓"}
              {t.type === "error"   && "✕"}
              {t.type === "info"    && "ℹ"}
            </span>
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Confirm modal ── */}
      {confirmModal && (
        <div
          className="admin-confirm-overlay"
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="admin-confirm-box"
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22, fontWeight: 600,
              color: A.textPrimary, marginBottom: 12,
            }}>
              ¿Confirmar acción?
            </h3>
            <p style={{ fontSize: 14, color: A.textSecondary, lineHeight: 1.65, marginBottom: 28 }}>
              {confirmModal.message}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="admin-btn-secondary"
                style={{ flex: 1, padding: "12px 0" }}
                onClick={() => setConfirmModal(null)}
              >
                Cancelar
              </button>
              <button
                className="admin-btn-danger"
                style={{ flex: 1, padding: "12px 0", background: A.dangerBg }}
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
