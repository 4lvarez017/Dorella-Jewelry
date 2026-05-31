import { useState, useEffect } from "react";
import { G } from "../styles/theme";
import { MOCK_ORDERS } from "../data/constants";
import { supabaseFetch } from "../lib/supabase";
import { useProducts } from "../context/ProductsContext";

// Paleta de colores Luxury Light
const LIGHT_THEME = {
  background: "#F5F5F7",
  cardBg: "#FFFFFF",
  sidebarBg: "#FFFFFF",
  textPrimary: "#1D1D1F",
  textSecondary: "#86868B",
  gold: "#C9A84C",
  goldDark: "#9A7A2E",
  goldLight: "#F0E4C3",
  border: "#E5E5EA",
  danger: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
};

const ORDER_STATUS_COLORS = {
  Pendiente: "#FF9500",
  Enviado: "#007AFF",
  Completado: "#34C759",
};

const CATEGORIES_LIST = [
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
  { name: "Brazaletes Niños", icon: "🪙" }
];

// ─── Modal para Ver Detalle del Pedido ──────────────────────────────────────────
function OrderDetailModal({ order, onClose }) {
  const fields = [
    ["ID de Pedido", order.id],
    ["Nombre del Cliente", order.customer_name],
    ["Teléfono", order.phone],
    ["Dirección", order.address],
    ["Ciudad", order.city],
    ["Método de Pago", order.payment_method],
    ["Estado actual", order.status],
    ["Total de la compra", `$${(order.total || 0).toLocaleString("es-CO")}`],
    ["Fecha de Creación", order.created_at ? new Date(order.created_at).toLocaleString("es-CO") : "No disponible"],
  ];

  let parsedItems = [];
  try {
    parsedItems = JSON.parse(order.items || "[]");
  } catch (_) {}

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1100 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: LIGHT_THEME.cardBg,
          maxWidth: "520px",
          width: "100%",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          border: `1px solid ${LIGHT_THEME.border}`,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ color: LIGHT_THEME.goldDark, fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 600 }}>
            Detalle del Pedido
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: LIGHT_THEME.textSecondary, fontSize: "20px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {fields.map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: `1px solid ${LIGHT_THEME.border}`,
              fontSize: "13px",
            }}
          >
            <span style={{ color: LIGHT_THEME.textSecondary, fontWeight: 500 }}>
              {k}
            </span>
            <span style={{ color: LIGHT_THEME.textPrimary, fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{v}</span>
          </div>
        ))}

        {parsedItems.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <p style={{ color: LIGHT_THEME.goldDark, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: "12px" }}>
              Productos en el pedido
            </p>
            <div style={{ background: "#F8F9FA", padding: "16px", borderRadius: "6px" }}>
              {parsedItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: idx < parsedItems.length - 1 ? `1px solid ${LIGHT_THEME.border}80` : "none", color: LIGHT_THEME.textPrimary }}
                >
                  <span>{item.name} <strong style={{ color: LIGHT_THEME.goldDark }}>×{item.qty}</strong></span>
                  <span style={{ fontWeight: 600 }}>${(item.price * item.qty).toLocaleString("es-CO")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal para Agregar / Editar Producto ──────────────────────────────────────
function ProductFormModal({ product, defaultCategory, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    category: "Anillos",
    price: "",
    stock: "",
    desc: "",
    image: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        category: product.category || "Anillos",
        price: product.price || "",
        stock: product.stock !== undefined ? product.stock : "",
        desc: product.desc || "",
        image: product.image || "",
      });
    } else if (defaultCategory) {
      setForm((f) => ({ ...f, category: defaultCategory }));
    }
  }, [product, defaultCategory]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      alert("Por favor completa los campos obligatorios (*)");
      return;
    }
    
    const itemData = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: form.stock !== "" ? Number(form.stock) : 10,
      desc: form.desc,
      image: form.image || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80", // placeholder lujo
    };

    onSave(itemData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1100 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: LIGHT_THEME.cardBg,
          maxWidth: "500px",
          width: "100%",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          border: `1px solid ${LIGHT_THEME.border}`,
        }}
      >
        <h3 style={{ color: LIGHT_THEME.goldDark, fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 600, marginBottom: "20px" }}>
          {product ? "Editar Producto" : "Registrar Nuevo Producto"}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: LIGHT_THEME.textPrimary, textTransform: "uppercase" }}>Nombre del Producto *</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Ej. Anillo Corona Esmeralda"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${LIGHT_THEME.border}`,
                borderRadius: "4px",
                marginTop: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: LIGHT_THEME.textPrimary, textTransform: "uppercase" }}>Categoría</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: `1px solid ${LIGHT_THEME.border}`,
                  borderRadius: "4px",
                  marginTop: "6px",
                  fontSize: "14px",
                  background: "#FFF",
                }}
              >
                {CATEGORIES_LIST.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: LIGHT_THEME.textPrimary, textTransform: "uppercase" }}>Precio (COP) *</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="Ej. 185000"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: `1px solid ${LIGHT_THEME.border}`,
                  borderRadius: "4px",
                  marginTop: "6px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: LIGHT_THEME.textPrimary, textTransform: "uppercase" }}>Stock Inicial</label>
            <input
              type="number"
              name="stock"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="Ej. 12"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${LIGHT_THEME.border}`,
                borderRadius: "4px",
                marginTop: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: LIGHT_THEME.textPrimary, textTransform: "uppercase" }}>Descripción</label>
            <textarea
              name="desc"
              rows="3"
              value={form.desc}
              onChange={handleChange}
              placeholder="Detalles sobre diseño, materiales, ajuste..."
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${LIGHT_THEME.border}`,
                borderRadius: "4px",
                marginTop: "6px",
                fontSize: "14px",
                resize: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: LIGHT_THEME.textPrimary, textTransform: "uppercase" }}>URL de la Imagen</label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${LIGHT_THEME.border}`,
                borderRadius: "4px",
                marginTop: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                background: "#E5E5EA",
                border: "none",
                borderRadius: "4px",
                color: LIGHT_THEME.textPrimary,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "12px",
                background: LIGHT_THEME.gold,
                border: "none",
                borderRadius: "4px",
                color: "#FFF",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(201, 168, 76, 0.2)",
              }}
            >
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente Principal Panel de Admin ───────────────────────────────────────
export function AdminPanel({ activeTab, setActiveTab, onLogout }) {
  const { products, addProduct, updateProduct, deleteProduct, toggleVisibility } = useProducts();

  // Estados de categoría internos (locales) — no dependen de la URL para evitar conflictos
  const [selectedInvCategory, setSelectedInvCategory] = useState(null);
  const [selectedProdCategory, setSelectedProdCategory] = useState(null);

  // Resetear categorías al cambiar de tab
  const handleSetActiveTab = (tab) => {
    setSelectedInvCategory(null);
    setSelectedProdCategory(null);
    setActiveTab(tab);
  };

  // Estados de Pedidos
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("Todos"); // 'Todos', 'Pendiente', 'Enviado', 'Completado'
  const [supabaseAvailable, setSupabaseAvailable] = useState(true); // Indica si Supabase respondió

  // Búsqueda de Productos dentro de una sección
  const [productSearch, setProductSearch] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);


  useEffect(() => {
    fetchOrders();
  }, []);

  // Lee pedidos del localStorage local (respaldo cuando Supabase no está disponible)
  function getLocalOrders() {
    try {
      return JSON.parse(localStorage.getItem("dorella_local_orders") || "[]");
    } catch (_) {
      return [];
    }
  }

  // Guarda array actualizado de pedidos locales
  function saveLocalOrders(orders) {
    try {
      localStorage.setItem("dorella_local_orders", JSON.stringify(orders));
    } catch (_) {}
  }

  async function fetchOrders() {
    setLoadingOrders(true);
    const localOrders = getLocalOrders();

    try {
      const supabaseOrders = await supabaseFetch("/orders?select=*&order=created_at.desc");

      // Fusionar: Supabase es la fuente de verdad; añadir locales que no estén ya en Supabase
      const supabaseIds = new Set(supabaseOrders.map((o) => o.id));
      const onlyLocal = localOrders.filter((o) => !supabaseIds.has(o.id));
      const merged = [...supabaseOrders, ...onlyLocal].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(merged);
      setSupabaseAvailable(true);
    } catch (_) {
      // Supabase no disponible — mostrar pedidos locales
      setSupabaseAvailable(false);
      if (localOrders.length > 0) {
        setOrders(localOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } else {
        // Sin pedidos locales ni Supabase: cargar mocks de demostración
        const today = new Date();
        const mockWithDates = MOCK_ORDERS.map((o, idx) => {
          const d = new Date(today);
          d.setDate(today.getDate() - idx * 2);
          return { ...o, created_at: d.toISOString(), _isMock: true };
        });
        setOrders(mockWithDates);
      }
    }
    setLoadingOrders(false);
  }

  async function updateOrderStatus(id, status) {
    // Actualizar en Supabase si está disponible
    try {
      await supabaseFetch(`/orders?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (_) {}

    // Actualizar también en localStorage
    const localOrders = getLocalOrders();
    const updatedLocal = localOrders.map((o) => (o.id === id ? { ...o, status } : o));
    saveLocalOrders(updatedLocal);

    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  // Filtrado de pedidos
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.city && o.city.toLowerCase().includes(orderSearch.toLowerCase()));
    
    if (orderFilter === "Todos") return matchesSearch;
    return matchesSearch && o.status === orderFilter;
  });

  // Métricas de Dashboard (Basadas en pedidos Completados)
  const orderMetrics = {
    revenue: orders.filter(o => o.status === "Completado").reduce((s, o) => s + (o.total || 0), 0),
    totalOrders: orders.length,
    pending: orders.filter(o => o.status === "Pendiente").length,
    completed: orders.filter(o => o.status === "Completado").length,
    avgTicket: orders.filter(o => o.status === "Completado").length > 0
      ? orders.filter(o => o.status === "Completado").reduce((s, o) => s + (o.total || 0), 0) / orders.filter(o => o.status === "Completado").length
      : 0
  };

  const lowStockProducts = products.filter(p => p.stock < 5);

  // Obtener ventas agrupadas por los últimos 7 días
  const getLast7DaysSales = () => {
    const salesMap = {};
    const today = new Date();
    
    // Inicializar los últimos 7 días con 0 ventas
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      salesMap[dateString] = {
        label: d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" }),
        total: 0
      };
    }
    
    // Sumar montos
    orders.filter(o => o.status === "Completado").forEach((o) => {
      if (o.created_at) {
        const dateString = o.created_at.split("T")[0];
        if (salesMap[dateString]) {
          salesMap[dateString].total += o.total;
        }
      }
    });

    return Object.values(salesMap);
  };

  const chartSalesData = getLast7DaysSales();
  const maxSalesInChart = Math.max(...chartSalesData.map(d => d.total), 1);

  // Obtener distribución de Métodos de Pago
  const getPaymentMethodsStats = () => {
    const stats = { Transferencia: 0, Nequi: 0, Daviplata: 0, Efectivo: 0, "Contra-entrega": 0 };
    orders.forEach(o => {
      const method = o.payment_method || "Efectivo";
      if (stats[method] !== undefined) {
        stats[method] += 1;
      } else {
        stats[method] = (stats[method] || 0) + 1;
      }
    });

    const total = Object.values(stats).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(stats).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
  };

  const paymentStats = getPaymentMethodsStats();

  // Obtener Top 3 productos más vendidos
  const getTopProducts = () => {
    const productCounts = {};
    orders.filter(o => o.status === "Completado").forEach(o => {
      try {
        const items = JSON.parse(o.items || "[]");
        items.forEach(item => {
          productCounts[item.name] = (productCounts[item.name] || 0) + item.qty;
        });
      } catch(_) {}
    });
    return Object.entries(productCounts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);
  };

  const topProducts = getTopProducts();

  // Guardar creación / edición de producto
  const handleSaveProduct = (data) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Exportador CSV de Pedidos
  const exportToCSV = () => {
    const headers = ["ID", "Cliente", "Teléfono", "Dirección", "Ciudad", "Pago", "Total", "Estado", "Productos"];
    const rows = orders.map(o => {
      let itemsStr = "";
      try {
        const items = JSON.parse(o.items || "[]");
        itemsStr = items.map(i => `${i.name} (x${i.qty})`).join("; ");
      } catch(_) {
        itemsStr = o.items;
      }
      return [
        o.id,
        o.customer_name,
        o.phone,
        o.address,
        o.city,
        o.payment_method,
        o.total,
        o.status,
        itemsStr
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pedidos_dorella_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ayudantes para conteos de categorías
  const getCategoryStats = (categoryName) => {
    const catProducts = products.filter(p => (p.category || "").startsWith(categoryName));
    const totalStock = catProducts.reduce((s, p) => s + (p.stock || 0), 0);
    const lowStockCount = catProducts.filter(p => (p.stock || 0) < 5).length;
    return {
      count: catProducts.length,
      stock: totalStock,
      lowStock: lowStockCount,
    };
  };

  // Productos filtrados por búsqueda de texto (para Inventario y Productos)
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.desc || "").toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: LIGHT_THEME.background,
        color: LIGHT_THEME.textPrimary,
        fontFamily: "'Jost', sans-serif",
        display: "flex",
      }}
    >
      {/* Estilos dinámicos locales */}
      <style>{`
        .sidebar-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sidebar-btn:hover {
          background: rgba(201, 168, 76, 0.05) !important;
          color: ${LIGHT_THEME.goldDark} !important;
        }
        .category-folder-card {
          background: ${LIGHT_THEME.cardBg};
          border: 1px solid ${LIGHT_THEME.border};
          border-radius: 8px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .category-folder-card span {
          display: inline-block;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .category-folder-card:hover {
          border-color: ${LIGHT_THEME.gold};
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(201, 168, 76, 0.12);
        }
        .category-folder-card:hover span {
          transform: scale(1.2) rotate(6deg);
        }
        .chart-bar-container:hover .chart-tooltip {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(-100%) scale(1) !important;
        }
        .animated-section {
          animation: sectionSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes sectionSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-hover-lux {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .btn-hover-lux:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .btn-hover-lux:active {
          transform: translateY(0);
        }
        tr {
          transition: background-color 0.15s ease;
        }
        tr:hover {
          background-color: rgba(201, 168, 76, 0.02) !important;
        }
      `}</style>

      {/* ─── SIDEBAR LATERAL ─────────────────────────────────────────────────── */}
      <aside
        style={{
          width: "280px",
          background: LIGHT_THEME.sidebarBg,
          borderRight: `1px solid ${LIGHT_THEME.border}`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          padding: "32px 0 24px",
          zIndex: 100,
        }}
      >
        {/* Cabecera / Logo */}
        <div style={{ padding: "0 28px", marginBottom: "40px" }}>
          <span style={{ color: LIGHT_THEME.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 600, display: "block" }}>
            Dorella Jewelry
          </span>
          <span style={{ fontSize: "10px", letterSpacing: "3px", color: LIGHT_THEME.textSecondary, textTransform: "uppercase", fontWeight: 500, marginTop: "4px", display: "block" }}>
            Panel Propietario
          </span>
        </div>

        {/* Enlaces de Pestañas */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          <button
            onClick={() => handleSetActiveTab("dashboard")}
            className="sidebar-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 28px",
              background: activeTab === "dashboard" ? `${LIGHT_THEME.gold}12` : "transparent",
              color: activeTab === "dashboard" ? LIGHT_THEME.goldDark : LIGHT_THEME.textPrimary,
              border: "none",
              borderLeft: `4px solid ${activeTab === "dashboard" ? LIGHT_THEME.gold : "transparent"}`,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all 0.2s",
            }}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => handleSetActiveTab("inventario")}
            className="sidebar-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 28px",
              background: activeTab === "inventario" ? `${LIGHT_THEME.gold}12` : "transparent",
              color: activeTab === "inventario" ? LIGHT_THEME.goldDark : LIGHT_THEME.textPrimary,
              border: "none",
              borderLeft: `4px solid ${activeTab === "inventario" ? LIGHT_THEME.gold : "transparent"}`,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all 0.2s",
            }}
          >
            📦 Inventario
          </button>

          <button
            onClick={() => handleSetActiveTab("productos")}
            className="sidebar-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 28px",
              background: activeTab === "productos" ? `${LIGHT_THEME.gold}12` : "transparent",
              color: activeTab === "productos" ? LIGHT_THEME.goldDark : LIGHT_THEME.textPrimary,
              border: "none",
              borderLeft: `4px solid ${activeTab === "productos" ? LIGHT_THEME.gold : "transparent"}`,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all 0.2s",
            }}
          >
            💍 Productos
          </button>

          <button
            onClick={() => handleSetActiveTab("pedidos")}
            className="sidebar-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 28px",
              background: activeTab === "pedidos" ? `${LIGHT_THEME.gold}12` : "transparent",
              color: activeTab === "pedidos" ? LIGHT_THEME.goldDark : LIGHT_THEME.textPrimary,
              border: "none",
              borderLeft: `4px solid ${activeTab === "pedidos" ? LIGHT_THEME.gold : "transparent"}`,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all 0.2s",
            }}
          >
            🧾 Pedidos
          </button>
        </nav>

        {/* Footer Sidebar / Logout */}
        <div style={{ padding: "0 28px", marginTop: "auto" }}>
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${LIGHT_THEME.border}`,
              background: "transparent",
              color: LIGHT_THEME.danger,
              fontWeight: 600,
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${LIGHT_THEME.danger}12`;
              e.currentTarget.style.borderColor = LIGHT_THEME.danger;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = LIGHT_THEME.border;
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ─── CONTENIDO PRINCIPAL (DERECHA) ──────────────────────────────────── */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto", minWidth: 0 }}>
        {/* Cabecera del Módulo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 className="serif" style={{ fontSize: "36px", fontWeight: 400, color: LIGHT_THEME.goldDark, textTransform: "capitalize" }}>
              {activeTab === "dashboard" ? "Dashboard de Negocios" : activeTab}
            </h1>
            <p style={{ color: LIGHT_THEME.textSecondary, fontSize: "14px", marginTop: "4px" }}>
              {activeTab === "dashboard" && "Resumen en tiempo real de finanzas, ventas, logística y existencias."}
              {activeTab === "inventario" && (selectedInvCategory ? `Stock actual para la categoría: ${selectedInvCategory}` : "Selecciona una categoría para controlar y editar el stock.")}
              {activeTab === "productos" && (selectedProdCategory ? `Catálogo de venta para: ${selectedProdCategory}` : "Selecciona una sección del catálogo para editar precios y visibilidad.")}
              {activeTab === "pedidos" && "Administración y seguimiento de pedidos generados en el sitio."}
            </p>
          </div>
        </div>

        {/* ─── PESTAÑA: DASHBOARD (NUEVO / RECONSTRUIDO) ────────────────────────── */}
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* 1. Tarjetas de Métricas Principales */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
              <div style={{ background: LIGHT_THEME.cardBg, padding: "24px", borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <p style={{ color: LIGHT_THEME.textSecondary, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: "8px" }}>
                  Ganancias (Completados)
                </p>
                <p style={{ fontSize: "28px", fontWeight: 600, color: LIGHT_THEME.goldDark }}>
                  ${orderMetrics.revenue.toLocaleString("es-CO")}
                </p>
              </div>

              <div style={{ background: LIGHT_THEME.cardBg, padding: "24px", borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <p style={{ color: LIGHT_THEME.textSecondary, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: "8px" }}>
                  Pedidos Recibidos
                </p>
                <p style={{ fontSize: "28px", fontWeight: 600, color: LIGHT_THEME.textPrimary }}>{orderMetrics.totalOrders}</p>
              </div>

              <div style={{ background: LIGHT_THEME.cardBg, padding: "24px", borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <p style={{ color: LIGHT_THEME.textSecondary, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: "8px" }}>
                  Ticket Promedio
                </p>
                <p style={{ fontSize: "28px", fontWeight: 600, color: LIGHT_THEME.textPrimary }}>
                  ${Math.round(orderMetrics.avgTicket).toLocaleString("es-CO")}
                </p>
              </div>

              <div style={{ background: LIGHT_THEME.cardBg, padding: "24px", borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <p style={{ color: LIGHT_THEME.textSecondary, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: "8px" }}>
                  Alertas de Stock Bajo
                </p>
                <p style={{ fontSize: "28px", fontWeight: 600, color: lowStockProducts.length > 0 ? LIGHT_THEME.warning : LIGHT_THEME.success }}>
                  {lowStockProducts.length}
                </p>
              </div>
            </div>

            {/* 2. Sección de Gráficos Duales */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
              {/* Gráfico de Ventas e Ingresos (CSS Fluido) */}
              <div style={{ background: LIGHT_THEME.cardBg, padding: "28px", borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ color: LIGHT_THEME.textPrimary, fontSize: "16px", fontWeight: 600, marginBottom: "24px" }}>
                  Ingresos Semanales (Pedidos Completados)
                </h3>
                
                {/* Contenedor del Gráfico de Barras */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "200px", padding: "0 10px", borderBottom: `1px solid ${LIGHT_THEME.border}`, position: "relative" }}>
                  {chartSalesData.map((dayData, idx) => {
                    // Proporción de la altura en base al máximo de ventas
                    const barHeight = `${Math.max(5, (dayData.total / maxSalesInChart) * 160)}px`;

                    return (
                      <div
                        key={idx}
                        className="chart-bar-container"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          flex: 1,
                          position: "relative",
                          cursor: "pointer",
                        }}
                      >
                        {/* Tooltip Hover */}
                        <div
                          className="chart-tooltip"
                          style={{
                            position: "absolute",
                            top: "-40px",
                            left: "50%",
                            transform: "translateX(-50%) translateY(-5px) scale(0.95)",
                            background: LIGHT_THEME.textPrimary,
                            color: "#FFF",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                            opacity: 0,
                            transition: "all 0.15s ease-out",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                            zIndex: 10,
                          }}
                        >
                          ${dayData.total.toLocaleString("es-CO")}
                        </div>

                        {/* Columna/Barra */}
                        <div
                          style={{
                            width: "28px",
                            height: barHeight,
                            background: `linear-gradient(180deg, ${LIGHT_THEME.gold} 0%, ${LIGHT_THEME.goldDark} 100%)`,
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.8s ease-in-out, filter 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                        />

                        {/* Etiqueta del Día */}
                        <span style={{ fontSize: "11px", color: LIGHT_THEME.textSecondary, marginTop: "8px", textTransform: "capitalize" }}>
                          {dayData.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gráfico de Métodos de Pago */}
              <div style={{ background: LIGHT_THEME.cardBg, padding: "28px", borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ color: LIGHT_THEME.textPrimary, fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>
                  Distribución de Métodos de Pago
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {paymentStats.map((item, idx) => (
                    <div key={idx}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        <span style={{ color: LIGHT_THEME.textSecondary }}>{item.count} pedidos ({item.percentage}%)</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "#E5E5EA", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${item.percentage}%`,
                            height: "100%",
                            background: LIGHT_THEME.gold,
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Fila Inferior: Top Ventas y Alertas Rápidas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Top Vendidos */}
              <div style={{ background: LIGHT_THEME.cardBg, padding: "24px", borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ color: LIGHT_THEME.textPrimary, fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
                  🏆 Productos Más Vendidos
                </h3>
                {topProducts.length === 0 ? (
                  <p style={{ color: LIGHT_THEME.textSecondary, fontSize: "13px" }}>No hay ventas registradas aún para calcular estadísticas.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {topProducts.map((p, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: idx < topProducts.length - 1 ? `1px solid ${LIGHT_THEME.border}` : "none" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>{idx + 1}. {p.name}</span>
                        <span style={{ background: `${LIGHT_THEME.gold}15`, color: LIGHT_THEME.goldDark, padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>
                          {p.qty} unidades
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pedidos Recientes (Vista Rápida) */}
              <div style={{ background: LIGHT_THEME.cardBg, padding: "24px", borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ color: LIGHT_THEME.textPrimary, fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
                  🔔 Pedidos Pendientes
                </h3>
                {orders.filter(o => o.status === "Pendiente").length === 0 ? (
                  <p style={{ color: LIGHT_THEME.success, fontSize: "13px", fontWeight: 600 }}>✅ ¡Al día! No hay pedidos pendientes de despacho.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {orders.filter(o => o.status === "Pendiente").slice(0, 3).map((o, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${LIGHT_THEME.border}` }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: "13px", display: "block" }}>{o.customer_name}</span>
                          <span style={{ fontSize: "11px", color: LIGHT_THEME.textSecondary }}>{o.id} | {o.city}</span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("pedidos");
                            setOrderFilter("Pendiente");
                          }}
                          style={{
                            background: "none",
                            border: `1px solid ${LIGHT_THEME.gold}`,
                            color: LIGHT_THEME.goldDark,
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Gestionar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── PESTAÑA: INVENTARIO (MODULADO POR SECCIONES) ────────────────────── */}
        {activeTab === "inventario" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Si no hay categoría seleccionada, mostramos la grilla modular */}
            {selectedInvCategory === null ? (
              <div className="animated-section">
                <h3 style={{ fontSize: "16px", color: LIGHT_THEME.textSecondary, fontWeight: 500, marginBottom: "20px" }}>
                  Colecciones de Joyas
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
                  {CATEGORIES_LIST.map((cat) => {
                    const stats = getCategoryStats(cat.name);
                    return (
                      <div
                        key={cat.name}
                        className="category-folder-card"
                        onClick={() => setSelectedInvCategory(cat.name)}
                      >
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>{cat.icon}</span>
                        <h4 style={{ fontSize: "18px", color: LIGHT_THEME.textPrimary, fontWeight: 600, marginBottom: "8px" }}>
                          {cat.name}
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: LIGHT_THEME.textSecondary }}>
                          <span>Artículos: <strong>{stats.count}</strong></span>
                          <span>Stock Total: <strong>{stats.stock} uds</strong></span>
                          {stats.lowStock > 0 && (
                            <span style={{ color: LIGHT_THEME.warning, fontWeight: 600 }}>
                              ⚠️ {stats.lowStock} con stock bajo
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Vista de Categoría Modulada */
              <div className="animated-section" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={() => setSelectedInvCategory(null)}
                    style={{
                      background: "none",
                      border: `1px solid ${LIGHT_THEME.gold}`,
                      color: LIGHT_THEME.goldDark,
                      padding: "8px 16px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    ← Volver a Secciones
                  </button>
                  <span style={{ fontSize: "14px", color: LIGHT_THEME.textSecondary }}>
                    Catálogo / Inventario / <strong>{selectedInvCategory}</strong>
                  </span>
                </div>

                {/* Tabla de Existencias de la sección seleccionada */}
                <div style={{ background: LIGHT_THEME.cardBg, borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                  <div style={{ padding: "20px", borderBottom: `1px solid ${LIGHT_THEME.border}`, display: "flex", gap: "12px" }}>
                    <input
                      type="text"
                      placeholder={`Buscar en ${selectedInvCategory}...`}
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        border: `1px solid ${LIGHT_THEME.border}`,
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#F8F9FA", borderBottom: `1px solid ${LIGHT_THEME.border}` }}>
                          <th style={{ padding: "16px 24px", color: LIGHT_THEME.goldDark, fontWeight: 600 }}>Producto</th>
                          <th style={{ padding: "16px 24px", color: LIGHT_THEME.goldDark, fontWeight: 600 }}>Stock Actual</th>
                          <th style={{ padding: "16px 24px", color: LIGHT_THEME.goldDark, fontWeight: 600, textAlign: "center" }}>Acciones de Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts
                          .filter((p) => (p.category || "").startsWith(selectedInvCategory))
                          .map((p) => {
                            const isLow = p.stock < 5;
                            const isOut = p.stock === 0;

                            return (
                              <tr key={p.id} style={{ borderBottom: `1px solid ${LIGHT_THEME.border}` }}>
                                <td style={{ padding: "16px 24px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <img src={p.image} alt={p.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", border: `1px solid ${LIGHT_THEME.border}` }} />
                                    <div>
                                      <span style={{ fontWeight: 600, display: "block" }}>{p.name}</span>
                                      <span style={{ fontSize: "11px", color: LIGHT_THEME.textSecondary }}>ID: {p.id}</span>
                                    </div>
                                  </div>
                                </td>

                                <td style={{ padding: "16px 24px" }}>
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      color: isOut ? LIGHT_THEME.danger : isLow ? LIGHT_THEME.warning : LIGHT_THEME.success,
                                      background: isOut ? `${LIGHT_THEME.danger}12` : isLow ? `${LIGHT_THEME.warning}12` : `${LIGHT_THEME.success}12`,
                                      padding: "4px 10px",
                                      borderRadius: "4px",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {p.stock} unidades
                                  </span>
                                </td>

                                <td style={{ padding: "16px 24px" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <button
                                      onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })}
                                      style={{ width: "32px", height: "32px", background: "#E5E5EA", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                                    >
                                      −
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={p.stock}
                                      onChange={(e) => updateProduct(p.id, { stock: Math.max(0, Number(e.target.value)) })}
                                      style={{ width: "60px", textAlign: "center", padding: "6px", border: `1px solid ${LIGHT_THEME.border}`, borderRadius: "4px", fontWeight: 600 }}
                                    />
                                    <button
                                      onClick={() => updateProduct(p.id, { stock: p.stock + 1 })}
                                      style={{ width: "32px", height: "32px", background: "#E5E5EA", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                                    >
                                      +
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`¿Eliminar "${p.name}" permanentemente del inventario?`)) {
                                          deleteProduct(p.id);
                                        }
                                      }}
                                      style={{ marginLeft: "12px", padding: "6px 12px", background: "none", border: `1px solid ${LIGHT_THEME.danger}40`, color: LIGHT_THEME.danger, borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PESTAÑA: PRODUCTOS (MODULADO POR SECCIONES) ────────────────────── */}
        {activeTab === "productos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Si no hay categoría de producto seleccionada, mostramos la grilla */}
            {selectedProdCategory === null ? (
              <div className="animated-section">
                <h3 style={{ fontSize: "16px", color: LIGHT_THEME.textSecondary, fontWeight: 500, marginBottom: "20px" }}>
                  Secciones del Catálogo
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
                  {CATEGORIES_LIST.map((cat) => {
                    const stats = getCategoryStats(cat.name);
                    return (
                      <div
                        key={cat.name}
                        className="category-folder-card"
                        onClick={() => setSelectedProdCategory(cat.name)}
                      >
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>{cat.icon}</span>
                        <h4 style={{ fontSize: "18px", color: LIGHT_THEME.textPrimary, fontWeight: 600, marginBottom: "8px" }}>
                          {cat.name}
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: LIGHT_THEME.textSecondary }}>
                          <span>Artículos: <strong>{stats.count} registrados</strong></span>
                          <span>Formato de Modulación Activo</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Vista de Edición de Catálogo Filtrado por Categoría */
              <div className="animated-section" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => setSelectedProdCategory(null)}
                      style={{
                        background: "none",
                        border: `1px solid ${LIGHT_THEME.gold}`,
                        color: LIGHT_THEME.goldDark,
                        padding: "8px 16px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ← Volver a Secciones
                    </button>
                    <span style={{ fontSize: "14px", color: LIGHT_THEME.textSecondary }}>
                      Catálogo / Productos / <strong>{selectedProdCategory}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductModal(true);
                    }}
                    style={{
                      background: LIGHT_THEME.gold,
                      color: "#FFF",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    + Registrar en {selectedProdCategory}
                  </button>
                </div>

                {/* Tabla de Productos de la Categoría */}
                <div style={{ background: LIGHT_THEME.cardBg, borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                  <div style={{ padding: "20px", borderBottom: `1px solid ${LIGHT_THEME.border}`, display: "flex", gap: "12px" }}>
                    <input
                      type="text"
                      placeholder={`Buscar en ${selectedProdCategory}...`}
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        border: `1px solid ${LIGHT_THEME.border}`,
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#F8F9FA", borderBottom: `1px solid ${LIGHT_THEME.border}` }}>
                          <th style={{ padding: "16px 24px", color: LIGHT_THEME.goldDark, fontWeight: 600 }}>Producto</th>
                          <th style={{ padding: "16px 24px", color: LIGHT_THEME.goldDark, fontWeight: 600 }}>Precio (COP)</th>
                          <th style={{ padding: "16px 24px", color: LIGHT_THEME.goldDark, fontWeight: 600 }}>Visibilidad Tienda</th>
                          <th style={{ padding: "16px 24px", color: LIGHT_THEME.goldDark, fontWeight: 600, textAlign: "center" }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts
                          .filter((p) => (p.category || "").startsWith(selectedProdCategory))
                          .map((p) => (
                            <tr key={p.id} style={{ borderBottom: `1px solid ${LIGHT_THEME.border}` }}>
                              <td style={{ padding: "16px 24px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <img src={p.image} alt={p.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "4px", border: `1px solid ${LIGHT_THEME.border}` }} />
                                  <div>
                                    <span style={{ fontWeight: 600, display: "block" }}>{p.name}</span>
                                    <span style={{ fontSize: "12px", color: LIGHT_THEME.textSecondary, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                      {p.desc || "Sin descripción."}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td style={{ padding: "16px 24px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <span style={{ fontWeight: 600 }}>$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={p.price}
                                    onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) })}
                                    style={{ width: "100px", padding: "6px", border: `1px solid ${LIGHT_THEME.border}`, borderRadius: "4px", fontWeight: 600 }}
                                  />
                                </div>
                              </td>

                              <td style={{ padding: "16px 24px" }}>
                                <button
                                  onClick={() => toggleVisibility(p.id)}
                                  style={{
                                    background: p.visible !== false ? `${LIGHT_THEME.success}12` : `${LIGHT_THEME.textSecondary}12`,
                                    color: p.visible !== false ? LIGHT_THEME.success : LIGHT_THEME.textSecondary,
                                    border: `1px solid ${p.visible !== false ? LIGHT_THEME.success : LIGHT_THEME.textSecondary}80`,
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  {p.visible !== false ? "👁️ Visible" : "🙈 Oculto"}
                                </button>
                              </td>

                              <td style={{ padding: "16px 24px", textAlign: "center" }}>
                                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setShowProductModal(true);
                                    }}
                                    style={{ background: "#FFF", border: `1px solid ${LIGHT_THEME.border}`, color: LIGHT_THEME.textPrimary, padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`¿Estás seguro de eliminar permanentemente "${p.name}"?`)) {
                                        deleteProduct(p.id);
                                      }
                                    }}
                                    style={{ background: "none", border: `1px solid ${LIGHT_THEME.danger}40`, color: LIGHT_THEME.danger, padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PESTAÑA: PEDIDOS ──────────────────────────────────────────────── */}
        {activeTab === "pedidos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Banner de aviso cuando Supabase no está disponible */}
            {!supabaseAvailable && (
              <div style={{
                background: "#FFF8E1",
                border: "1px solid #FFB300",
                borderRadius: "8px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}>
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <div>
                  <p style={{ fontWeight: 700, color: "#7A5800", fontSize: "14px", marginBottom: "4px" }}>
                    Supabase sin conexión — Mostrando pedidos locales
                  </p>
                  <p style={{ color: "#7A5800", fontSize: "12px", lineHeight: 1.6 }}>
                    Los pedidos del cliente se están guardando en este dispositivo. Para sincronizarlos con la nube,
                    ve a <strong>supabase.com → SQL Editor</strong> y ejecuta el archivo <code>supabase_orders_rls.sql</code> del proyecto.
                  </p>
                </div>
              </div>
            )}

            {/* Tabla de Órdenes y Controles */}
            <div style={{ background: LIGHT_THEME.cardBg, borderRadius: "8px", border: `1px solid ${LIGHT_THEME.border}`, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
              {/* Filtros e informes */}
              <div style={{ padding: "20px", borderBottom: `1px solid ${LIGHT_THEME.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                {/* Filtro estado */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {["Todos", "Pendiente", "Enviado", "Completado"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderFilter(status)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "4px",
                        border: `1px solid ${orderFilter === status ? LIGHT_THEME.gold : LIGHT_THEME.border}`,
                        background: orderFilter === status ? `${LIGHT_THEME.gold}12` : "#FFF",
                        color: orderFilter === status ? LIGHT_THEME.goldDark : LIGHT_THEME.textPrimary,
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "12px", flex: 1, maxWidth: "500px" }}>
                  <input
                    type="text"
                    placeholder="Buscar pedido por cliente, ID o ciudad..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: `1px solid ${LIGHT_THEME.border}`,
                      borderRadius: "4px",
                      fontSize: "13px",
                    }}
                  />
                  <button
                    onClick={exportToCSV}
                    style={{
                      background: "#FFF",
                      border: `1px solid ${LIGHT_THEME.gold}`,
                      color: LIGHT_THEME.goldDark,
                      padding: "8px 16px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    📥 Exportar CSV
                  </button>
                </div>
              </div>

              {loadingOrders ? (
                <p style={{ padding: "40px", textAlign: "center", color: LIGHT_THEME.textSecondary }}>Cargando pedidos...</p>
              ) : filteredOrders.length === 0 ? (
                <p style={{ padding: "40px", textAlign: "center", color: LIGHT_THEME.textSecondary }}>No se encontraron pedidos con los filtros aplicados.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#F8F9FA", borderBottom: `1px solid ${LIGHT_THEME.border}` }}>
                        {["ID Pedido", "Cliente", "Ciudad", "Total", "Método Pago", "Estado", "Acciones"].map((h) => (
                          <th key={h} style={{ padding: "16px 20px", color: LIGHT_THEME.goldDark, fontWeight: 600, textAlign: "left" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.id} style={{ borderBottom: `1px solid ${LIGHT_THEME.border}`, transition: "background 0.2s" }}>
                          <td style={{ padding: "16px 20px", fontWeight: 700, fontFamily: "monospace", color: LIGHT_THEME.goldDark }}>{o.id}</td>
                          <td style={{ padding: "16px 20px", fontWeight: 600 }}>{o.customer_name}</td>
                          <td style={{ padding: "16px 20px", color: LIGHT_THEME.textSecondary }}>{o.city || "No especificada"}</td>
                          <td style={{ padding: "16px 20px", fontWeight: 700 }}>${(o.total || 0).toLocaleString("es-CO")}</td>
                          <td style={{ padding: "16px 20px", color: LIGHT_THEME.textSecondary }}>{o.payment_method}</td>
                          <td style={{ padding: "16px 20px" }}>
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              style={{
                                border: `1px solid ${ORDER_STATUS_COLORS[o.status] || LIGHT_THEME.border}80`,
                                color: ORDER_STATUS_COLORS[o.status] || LIGHT_THEME.textPrimary,
                                background: `${ORDER_STATUS_COLORS[o.status]}08`,
                                padding: "6px 12px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="Enviado">Enviado</option>
                              <option value="Completado">Completado</option>
                            </select>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <button
                              onClick={() => setSelectedOrder(o)}
                              style={{
                                background: "#FFF",
                                border: `1px solid ${LIGHT_THEME.border}`,
                                color: LIGHT_THEME.textPrimary,
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 500,
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = LIGHT_THEME.gold;
                                e.currentTarget.style.color = LIGHT_THEME.goldDark;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = LIGHT_THEME.border;
                                e.currentTarget.style.color = LIGHT_THEME.textPrimary;
                              }}
                            >
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ─── MODALES DE INTERACCIÓN ────────────────────────────────────────── */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          defaultCategory={selectedProdCategory}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
