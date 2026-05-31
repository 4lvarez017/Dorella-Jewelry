import { useState } from "react";
import { G } from "../styles/theme";
import { WHATSAPP_NUMBER } from "../data/constants";
import { useCart } from "../context/CartContext";
import { supabaseFetch } from "../lib/supabase";

const INPUT_STYLE = {
  width: "100%",
  padding: "10px 14px",
  border: `1px solid ${G.creamDark}`,
  fontSize: "14px",
  marginTop: "6px",
  background: G.cream,
};

const LABEL_STYLE = {
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  color: G.textMid,
};

// ─── Helpers de localStorage ──────────────────────────────────────────────────
export function getLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem("dorella_local_orders") || "[]");
  } catch (_) {
    return [];
  }
}

export function saveLocalOrders(orders) {
  try {
    localStorage.setItem("dorella_local_orders", JSON.stringify(orders));
  } catch (_) { }
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function CheckoutModal({ onClose }) {
  const { cart, total, dispatch } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Ocaña",
    paymentMethod: "Transferencia",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    setError(null);

    const orderId = `DJ-${Date.now()}`;
    const orderData = {
      id: orderId,
      customer_name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      payment_method: form.paymentMethod,
      items: JSON.stringify(
        cart.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price }))
      ),
      total,
      status: "Pendiente",
      created_at: new Date().toISOString(),
    };

    try {
      // Guardar en Supabase
      await supabaseFetch("/orders", {
        method: "POST",
        headers: {
          "Prefer": "return=representation"
        },
        body: JSON.stringify(orderData)
      });
    } catch (err) {
      console.error("Error guardando el pedido en Supabase:", err);
      // Aunque falle Supabase, permitimos que continúe localmente y por WhatsApp para no perder la venta
    }

    // Guardar en localStorage
    const existing = getLocalOrders();
    existing.unshift(orderData);
    saveLocalOrders(existing);

    // Construir mensaje WhatsApp
    const productList = cart.map((i) => `${i.name} x${i.qty}`).join(", ");
    const msg = encodeURIComponent(
      `Hola Dorella Jewelry, he realizado un pedido web.\n\nMis datos son: ${form.name}, ${form.address}, ${form.city}.\n\nEl pedido incluye: ${productList}.\n\nTotal: $${total.toLocaleString("es-CO")}.\n\nID de pedido: ${orderId}`
    );

    setSuccess(orderId);
    dispatch({ type: "CLEAR" });
    setLoading(false);
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setTimeout(
      () => {
        if (isMobile) {
          window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
        } else {
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
        }
      },
      800
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        {/* Header */}
        <div
          style={{
            background: G.carbon,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 className="serif" style={{ color: G.textDark, fontSize: "22px", fontWeight: 400 }}>
            Confirmar Pedido
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: G.textDark, fontSize: "24px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Éxito */}
        {success ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h3 className="serif" style={{ fontSize: "28px", color: G.gold, marginBottom: "12px" }}>
              ¡Pedido Registrado!
            </h3>
            <p style={{ color: G.textMid, marginBottom: "8px" }}>
              ID: <strong>{success}</strong>
            </p>
            <p style={{ color: G.textMuted, fontSize: "14px" }}>
              Serás redirigido a WhatsApp para confirmar con el equipo Dorella...
            </p>
          </div>
        ) : (
          /* Formulario */
          <div style={{ padding: "24px" }}>
            <p style={{ fontSize: "13px", color: G.textMuted, marginBottom: "20px" }}>
              Sin necesidad de cuenta. Completa los datos para confirmar.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label style={LABEL_STYLE}>Nombre Completo *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                style={INPUT_STYLE}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={LABEL_STYLE}>Teléfono / WhatsApp *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+57 300 000 0000"
                style={INPUT_STYLE}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={LABEL_STYLE}>Dirección de Entrega *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Calle, Barrio, Ciudad"
                style={INPUT_STYLE}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={LABEL_STYLE}>Ciudad</label>
                <select name="city" value={form.city} onChange={handleChange} style={INPUT_STYLE}>
                  <option>Ocaña</option>
                  <option>Montería</option>
                  <option>Otra ciudad</option>
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>Método de Pago</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} style={INPUT_STYLE}>
                  <option>Transferencia</option>
                  <option>Nequi</option>
                  <option>Daviplata</option>
                  <option>Efectivo</option>
                  <option>Contra-entrega</option>
                </select>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div style={{ background: G.creamDark, padding: "12px 16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "4px" }}>
                <span>Productos ({cart.length})</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                <span>Total</span>
                <span style={{ color: G.gold }}>${total.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {error && (
              <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
            )}

            <button
              className="gold-btn"
              style={{ width: "100%" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Confirmar Pedido → WhatsApp"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
