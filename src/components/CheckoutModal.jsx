import { useState, useEffect, useRef } from "react";
import { G } from "../styles/theme";
import { WHATSAPP_NUMBER } from "../data/constants";
import { useCart } from "../context/CartContext";
import { supabaseFetch } from "../lib/supabase";

// ─── Clave pública de Wompi (modo test/producción) ────────────────────────────
// Reemplaza con tu clave pública real de https://comercios.wompi.co
const WOMPI_PUBLIC_KEY = "pub_test_yourkey"; // ← Cambiar a tu clave real

const INPUT_STYLE = {
  width: "100%",
  padding: "10px 14px",
  border: `1px solid ${G.creamDark}`,
  fontSize: "14px",
  marginTop: "6px",
  background: G.cream,
  color: G.textDark,
  fontFamily: "'Jost', sans-serif",
  borderRadius: "2px",
  transition: "border-color 0.3s",
};

const LABEL_STYLE = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: G.textMuted,
};

// ─── Helpers de localStorage (compatibilidad) ─────────────────────────────────
export function getLocalOrders() {
  try { return JSON.parse(localStorage.getItem("dorella_local_orders") || "[]"); }
  catch (_) { return []; }
}
export function saveLocalOrders(orders) {
  try { localStorage.setItem("dorella_local_orders", JSON.stringify(orders)); }
  catch (_) { }
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function CheckoutModal({ onClose }) {
  const { cart, total, dispatch } = useCart();
  const wompiRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Ocaña",
    paymentMethod: "WhatsApp",
  });
  const [step, setStep] = useState("form"); // "form" | "success" | "payment"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ─── Guardar pedido en Supabase ───────────────────────────────────────────
  const saveOrder = async (payMethod) => {
    const id = `DJ-${Date.now()}`;
    const orderData = {
      id,
      customer_name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      payment_method: payMethod,
      items: JSON.stringify(cart.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price }))),
      total,
      status: "Pendiente",
      created_at: new Date().toISOString(),
    };
    try {
      await supabaseFetch("/orders", {
        method: "POST",
        headers: { "Prefer": "return=minimal" },
        body: JSON.stringify(orderData),
      });
    } catch (err) {
      console.warn("Supabase order save failed:", err);
    }
    const existing = getLocalOrders();
    existing.unshift(orderData);
    saveLocalOrders(existing);
    return id;
  };

  // ─── Flujo WhatsApp (original) ────────────────────────────────────────────
  const handleWhatsApp = async () => {
    if (!form.name || !form.phone || !form.address) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    setError(null);
    const id = await saveOrder("WhatsApp");
    setOrderId(id);
    dispatch({ type: "CLEAR" });
    setLoading(false);
    setStep("success");
    const productList = cart.map((i) => `${i.name} x${i.qty}`).join(", ");
    const msg = encodeURIComponent(
      `Hola Dorella Jewelry 💎, acabo de realizar un pedido desde la web.\n\n👤 *${form.name}*\n📱 ${form.phone}\n📍 ${form.address}, ${form.city}\n\n🛒 *Productos:* ${productList}\n\n💰 *Total: $${total.toLocaleString("es-CO")}*\n\n🆔 Pedido: ${id}`
    );
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    setTimeout(() => {
      if (isMobile) window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
      else window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    }, 800);
  };

  // ─── Flujo Wompi ──────────────────────────────────────────────────────────
  const handleWompiPay = async () => {
    if (!form.name || !form.phone || !form.address) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    setError(null);
    const id = await saveOrder("Wompi - Pago en línea");
    setOrderId(id);
    setLoading(false);
    setStep("payment");
  };

  // Montar widget de Wompi cuando se cambia al paso "payment"
  useEffect(() => {
    if (step !== "payment" || !wompiRef.current) return;

    // Limpiar cualquier botón anterior
    wompiRef.current.innerHTML = "";

    // Crear el script dinámicamente
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.setAttribute("data-render", "button");
    script.setAttribute("data-public-key", WOMPI_PUBLIC_KEY);
    script.setAttribute("data-currency", "COP");
    script.setAttribute("data-amount-in-cents", String(total * 100));
    script.setAttribute("data-reference", orderId);
    script.setAttribute("data-signature:integrity", ""); // En producción se genera desde tu servidor
    script.setAttribute("data-customer-data:email", `${form.phone}@dorellajewelry.com`);
    script.setAttribute("data-customer-data:full-name", form.name);
    script.setAttribute("data-customer-data:phone-number", form.phone);
    script.setAttribute("data-customer-data:phone-number-prefix", "+57");

    // Callback de éxito
    script.setAttribute("data-redirect-url", window.location.href);

    wompiRef.current.appendChild(script);

    // Escuchar evento de pago exitoso de Wompi
    const handleMessage = (e) => {
      if (e.data?.type === "wompi:transaction" && e.data?.status === "APPROVED") {
        dispatch({ type: "CLEAR" });
        setStep("success_payment");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [step]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <style>{`
        .checkout-input:focus {
          outline: none;
          border-color: ${G.gold} !important;
        }
        .pay-option-btn {
          flex: 1;
          padding: 14px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .pay-wa-btn {
          background: rgba(37, 211, 102, 0.1);
          border: 1px solid rgba(37, 211, 102, 0.4);
          color: #25D366;
        }
        .pay-wa-btn:hover {
          background: rgba(37, 211, 102, 0.18);
          border-color: #25D366;
          box-shadow: 0 0 16px rgba(37, 211, 102, 0.2);
        }
        .pay-online-btn {
          background: rgba(201, 168, 76, 0.1);
          border: 1px solid rgba(201, 168, 76, 0.4);
          color: ${G.gold};
        }
        .pay-online-btn:hover {
          background: rgba(201, 168, 76, 0.18);
          border-color: ${G.gold};
          box-shadow: 0 0 16px rgba(201, 168, 76, 0.2);
        }
        .pay-online-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .wompi-container form button {
          width: 100% !important;
        }
      `}</style>

      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        {/* Header */}
        <div style={{ background: G.carbon, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="serif" style={{ color: G.textDark, fontSize: "22px", fontWeight: 400 }}>
            {step === "payment" ? "Pago Seguro" : "Confirmar Pedido"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: G.textDark, fontSize: "24px", cursor: "pointer" }}>✕</button>
        </div>

        {/* ── Éxito WhatsApp ── */}
        {step === "success" && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h3 className="serif" style={{ fontSize: "28px", color: G.gold, marginBottom: "12px" }}>¡Pedido Registrado!</h3>
            <p style={{ color: G.textMid, marginBottom: "8px" }}>ID: <strong>{orderId}</strong></p>
            <p style={{ color: G.textMuted, fontSize: "13px" }}>Te estamos redirigiendo a WhatsApp para confirmar con el equipo Dorella...</p>
          </div>
        )}

        {/* ── Éxito pago online ── */}
        {step === "success_payment" && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💎</div>
            <h3 className="serif" style={{ fontSize: "28px", color: G.gold, marginBottom: "12px" }}>¡Pago Exitoso!</h3>
            <p style={{ color: G.textMid, marginBottom: "8px" }}>ID: <strong>{orderId}</strong></p>
            <p style={{ color: G.textMuted, fontSize: "13px" }}>Recibirás la confirmación pronto. ¡Gracias por tu compra en Dorella Jewelry!</p>
          </div>
        )}

        {/* ── Widget de Wompi ── */}
        {step === "payment" && (
          <div style={{ padding: "28px 24px" }}>
            <div style={{ background: G.creamDark, padding: "12px 16px", borderRadius: 4, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: G.textMuted, marginBottom: 4 }}>Total a pagar</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: G.gold }}>${total.toLocaleString("es-CO")} COP</p>
              <p style={{ fontSize: 11, color: G.textMuted, marginTop: 4 }}>Pedido: {orderId}</p>
            </div>

            {WOMPI_PUBLIC_KEY === "pub_test_yourkey" ? (
              <div style={{ background: "rgba(201,168,76,0.08)", border: `1px solid ${G.gold}40`, borderRadius: 4, padding: 20, textAlign: "center" }}>
                <p style={{ fontSize: "24px", marginBottom: 12 }}>⚙️</p>
                <p style={{ color: G.gold, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Configuración pendiente</p>
                <p style={{ color: G.textMuted, fontSize: 12, lineHeight: 1.6 }}>
                  Para activar pagos en línea, regístrate en{" "}
                  <a href="https://comercios.wompi.co" target="_blank" rel="noreferrer" style={{ color: G.gold }}>comercios.wompi.co</a>
                  {" "}y reemplaza <code style={{ background: G.creamDark, padding: "2px 6px", borderRadius: 2 }}>WOMPI_PUBLIC_KEY</code> en el código con tu clave real.
                </p>
              </div>
            ) : (
              <div ref={wompiRef} className="wompi-container" style={{ minHeight: 60 }} />
            )}

            <button
              onClick={() => setStep("form")}
              style={{ marginTop: 16, background: "none", border: "none", color: G.textMuted, fontSize: 12, cursor: "pointer", textDecoration: "underline", width: "100%" }}
            >
              ← Volver al formulario
            </button>
          </div>
        )}

        {/* ── Formulario ── */}
        {step === "form" && (
          <div style={{ padding: "24px" }}>
            <p style={{ fontSize: "13px", color: G.textMuted, marginBottom: "20px" }}>
              Sin necesidad de cuenta. Completa tus datos para continuar.
            </p>

            {/* Nombre */}
            <div style={{ marginBottom: "14px" }}>
              <label style={LABEL_STYLE}>Nombre Completo *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" style={INPUT_STYLE} className="checkout-input" />
            </div>

            {/* Teléfono */}
            <div style={{ marginBottom: "14px" }}>
              <label style={LABEL_STYLE}>Teléfono / WhatsApp *</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+57 300 000 0000" style={INPUT_STYLE} className="checkout-input" />
            </div>

            {/* Dirección */}
            <div style={{ marginBottom: "14px" }}>
              <label style={LABEL_STYLE}>Dirección de Entrega *</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Calle, Barrio, Ciudad" style={INPUT_STYLE} className="checkout-input" />
            </div>

            {/* Ciudad */}
            <div style={{ marginBottom: "20px" }}>
              <label style={LABEL_STYLE}>Ciudad</label>
              <select name="city" value={form.city} onChange={handleChange} style={INPUT_STYLE}>
                <option>Ocaña</option>
                <option>Montería</option>
                <option>Bogotá</option>
                <option>Medellín</option>
                <option>Cali</option>
                <option>Barranquilla</option>
                <option>Bucaramanga</option>
                <option>Otra ciudad</option>
              </select>
            </div>

            {/* Resumen */}
            <div style={{ background: G.creamDark, padding: "12px 16px", marginBottom: "20px", borderRadius: 2 }}>
              {cart.map(i => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: G.textMid }}>
                  <span>{i.name} <span style={{ color: G.textMuted }}>×{i.qty}</span></span>
                  <span>${(i.price * i.qty).toLocaleString("es-CO")}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${G.creamDark}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: G.gold }}>${total.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "14px" }}>{error}</p>}

            {/* Botones de pago */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* WhatsApp */}
              <button
                className="pay-option-btn pay-wa-btn"
                onClick={handleWhatsApp}
                disabled={loading}
              >
                <span style={{ fontSize: 22 }}>💬</span>
                <span>{loading ? "Procesando..." : "Confirmar por WhatsApp"}</span>
                <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>Gratis · Sin comisiones</span>
              </button>

              {/* Wompi */}
              <button
                className="pay-option-btn pay-online-btn"
                onClick={handleWompiPay}
                disabled={loading}
              >
                <span style={{ fontSize: 22 }}>💳</span>
                <span>{loading ? "Procesando..." : "Pagar en Línea"}</span>
                <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>Tarjeta · Nequi · PSE</span>
              </button>
            </div>

            <p style={{ fontSize: 10, color: G.textMuted, textAlign: "center", marginTop: 12, letterSpacing: "0.5px" }}>
              🔒 Pago seguro con Wompi by Bancolombia
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
