import { useState, useEffect, useRef } from "react";
import { adminCSS, A } from "../components/admin/AdminTheme";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminHeader }  from "../components/admin/AdminHeader";
import { DashboardTab } from "../components/admin/DashboardTab";
import { InventarioTab } from "../components/admin/InventarioTab";
import { ProductosTab }  from "../components/admin/ProductosTab";
import { PedidosTab }    from "../components/admin/PedidosTab";
import { ReviewsTab }    from "../components/admin/ReviewsTab";
import { supabaseFetch } from "../lib/supabase";
import { useProducts }   from "../context/ProductsContext";
import { MOCK_ORDERS }   from "../data/constants";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
async function exportToExcel(orders) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Pedidos");

  // 1. Títulos y Marca (Estilo premium en oro y gris oscuro)
  const titleRow = worksheet.addRow(["👑 DORELLA JEWELRY - PANEL DE CONTROL"]);
  titleRow.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF9A7A2E" } };

  const subtitleRow = worksheet.addRow(["REPORTE OFICIAL DE PEDIDOS E INGRESOS"]);
  subtitleRow.font = { name: "Arial", size: 12, bold: true, color: { argb: "FF6B6B70" } };

  const metaRow = worksheet.addRow([`Generado el: ${new Date().toLocaleString("es-CO")}`]);
  metaRow.font = { name: "Arial", size: 9, italic: true, color: { argb: "FFA0A0A8" } };

  worksheet.addRow([]); // Fila vacía de separación

  // 2. Cabeceras con relleno dorado
  const headers = ["ID Pedido", "Fecha", "Cliente", "Teléfono", "Dirección", "Ciudad", "Método Pago", "Total", "Estado", "Detalle Productos"];
  const headerRow = worksheet.addRow(headers);
  
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF9A7A2E" } // Color dorado oscuro de la joyería
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFEDE9E3" } },
      left: { style: "thin", color: { argb: "FFEDE9E3" } },
      bottom: { style: "medium", color: { argb: "FFC9A84C" } },
      right: { style: "thin", color: { argb: "FFEDE9E3" } }
    };
  });

  // 3. Filas de datos
  orders.forEach((o, index) => {
    let itemsStr;
    try {
      itemsStr = JSON.parse(o.items || "[]")
        .map(i => `${i.name} (x${i.qty})`)
        .join("; ");
    } catch (_) {
      itemsStr = o.items || "";
    }
    const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString("es-CO") : "—";
    
    const row = worksheet.addRow([
      o.id,
      dateStr,
      o.customer_name,
      o.phone || "—",
      o.address || "—",
      o.city || "—",
      o.payment_method,
      Number(o.total || 0),
      o.status,
      itemsStr
    ]);

    row.height = 20;

    // Alternar fondo cebrado para legibilidad
    const isEven = index % 2 === 0;
    const rowBg = isEven ? "FFFFFFFF" : "FFFDFBF8";

    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 10 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowBg }
      };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFEDE9E3" } },
        right: { style: "thin", color: { argb: "FFEDE9E3" } }
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };

      // Columna de total
      if (colNumber === 8) {
        cell.numFmt = '"$"#,##0';
        cell.alignment = { vertical: "middle", horizontal: "right" };
        cell.font = { name: "Arial", size: 10, bold: true };
      }

      // Columna de estado (Color condicional)
      if (colNumber === 9) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        if (o.status === "Completado") {
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF2E7D32" } }; // success green
        } else if (o.status === "Enviado") {
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF1565C0" } }; // info blue
        } else {
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFE65100" } }; // warning orange
        }
      }
    });
  });

  // Configurar anchos de columnas
  worksheet.columns = [
    { width: 22 }, // ID Pedido
    { width: 14 }, // Fecha
    { width: 25 }, // Cliente
    { width: 16 }, // Teléfono
    { width: 32 }, // Dirección
    { width: 16 }, // Ciudad
    { width: 18 }, // Método Pago
    { width: 16 }, // Total
    { width: 14 }, // Estado
    { width: 55 }  // Detalle Productos
  ];

  // Generar y descargar el archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `pedidos_dorella_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ─── Exportar PDF ─────────────────────────────────────────────────────────────
function exportToPDF(orders) {
  // jsPDF en horizontal (landscape, A4: 297mm x 210mm)
  const doc = new jsPDF("landscape", "mm", "a4");

  // Métricas financieras y totales
  const completed = orders.filter(o => o.status === "Completado");
  const revenue = completed.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === "Pendiente").length;
  const sentCount = orders.filter(o => o.status === "Enviado").length;

  // 1. Barra superior corporativa (Dorado de la joyería)
  doc.setFillColor(154, 122, 46); // Dorado oscuro #9A7A2E
  doc.rect(0, 0, 297, 13, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("👑 DORELLA JEWELRY  |  REPORTE COMPLETO DE VENTAS Y LOGÍSTICA", 14, 8);

  // 2. Información del Reporte
  doc.setTextColor(29, 29, 31);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Resumen General de Pedidos", 14, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 107, 112);
  doc.text(`Generado el: ${new Date().toLocaleString("es-CO")}`, 14, 30);

  // 3. Tarjeta de KPIs / Resumen (Caja a la derecha)
  doc.setFillColor(247, 245, 242); // #F7F5F2
  doc.rect(178, 17, 105, 15, "F");
  
  doc.setDrawColor(201, 168, 76); // Borde dorado
  doc.setLineWidth(0.3);
  doc.rect(178, 17, 105, 15, "D");

  doc.setTextColor(154, 122, 46);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(`Ingresos Completados: $${revenue.toLocaleString("es-CO")} COP`, 182, 23);

  doc.setTextColor(80, 80, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Pedidos Totales: ${orders.length}  |  Pendientes: ${pendingCount}  |  Enviados: ${sentCount}`, 182, 28);

  // 4. Separador visual
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(14, 36, 283, 36);

  // 5. Preparar datos de la tabla
  const tableColumn = ["ID Pedido", "Fecha", "Cliente", "Teléfono", "Ciudad", "Método Pago", "Total", "Estado", "Detalle de Productos"];
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

  // 6. Generar AutoTable con autoTable importado de forma segura (Compatible con Vite)
  autoTable(doc, {
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [154, 122, 46], // Fondo de cabeceras en dorado
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold"
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [29, 29, 31],
      valign: "middle"
    },
    columnStyles: {
      0: { cellWidth: 22 }, // ID Pedido
      1: { cellWidth: 20 }, // Fecha
      2: { cellWidth: 32 }, // Cliente
      3: { cellWidth: 22 }, // Teléfono
      4: { cellWidth: 22 }, // Ciudad
      5: { cellWidth: 25 }, // Método Pago
      6: { cellWidth: 22, halign: "right", fontStyle: "bold" }, // Total
      7: { cellWidth: 22, halign: "center" }, // Estado
      8: { cellWidth: "auto" } // Detalle Productos
    },
    styles: {
      overflow: "linebreak",
      cellPadding: 2.5
    },
    didDrawPage: (data) => {
      // Pie de página corporativo
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 168);
      doc.text(`Página ${data.pageNumber}`, 14, doc.internal.pageSize.height - 8);
      doc.text("👑 Dorella Jewelry — Sistema de Gestión Administrativa", doc.internal.pageSize.width - 92, doc.internal.pageSize.height - 8);
    }
  });

  // Guardar archivo
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

  // ── Actualizar estado de pedido ────────────────────────────────────────────────────────────
  async function updateOrderStatus(id, status) {
    // Actualizar UI optimistamente
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    const updated = getLocalOrders().map(o => o.id === id ? { ...o, status } : o);
    saveLocalOrders(updated);
    try {
      await supabaseFetch(`/orders?id=eq.${id}`, {
        method: "PATCH",
        headers: { "Prefer": "return=minimal" },
        body: JSON.stringify({ status }),
      });
      addToast(`Estado → ${status} ✓`);
    } catch (e) {
      console.error("Error actualizando estado:", e);
      addToast("Error al actualizar estado", "error");
    }
  }

  // ── Eliminar pedido ───────────────────────────────────────────────────────────────────────
  async function deleteOrder(id) {
    // 1. Borrar del estado local inmediatamente (optimistic UI)
    setOrders(prev => prev.filter(o => o.id !== id));
    const updatedLocal = getLocalOrders().filter(o => o.id !== id);
    saveLocalOrders(updatedLocal);

    // 2. Borrar de Supabase
    try {
      await supabaseFetch(`/orders?id=eq.${id}`, {
        method: "DELETE",
        headers: { "Prefer": "return=minimal" },
      });
      addToast("Pedido eliminado ✓", "error");
    } catch (e) {
      console.error("Error al eliminar pedido en Supabase:", e);
      // Re-sincronizar para que si falló, el pedido vuelva a aparecer
      await fetchOrders();
      addToast("Error al eliminar — intenta de nuevo", "error");
    }
  }

  // ── Stats por categoría ─────────────────────────────────────────────────────
  const getCategoryStats = name => {
    const cat = products.filter(p => (p.category || "") === name);
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
                {activeTab === "resenas"    && "Reseñas"}
              </h1>
              <p style={{ fontSize: 13, color: A.textSecondary, marginTop: 6 }}>
                {activeTab === "dashboard"  && "Resumen en tiempo real de finanzas, ventas y existencias."}
                {activeTab === "inventario" && "Controla el stock de cada categoría de joyería."}
                {activeTab === "productos"  && "Gestiona precios, visibilidad y registro de piezas."}
                {activeTab === "pedidos"    && "Administra y hace seguimiento de todos los pedidos."}
                {activeTab === "resenas"    && "Modera y gestiona las opiniones de los clientes."}
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

            {activeTab === "resenas" && (
              <ReviewsTab
                addToast={addToast}
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
