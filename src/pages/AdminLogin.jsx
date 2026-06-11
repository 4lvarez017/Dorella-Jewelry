import { useState } from "react";
import { G } from "../styles/theme";
import { signIn } from "../lib/supabase";

export function AdminLogin({ onLogin }) {
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!creds.email || !creds.password) {
      setError("Completa todos los campos");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(creds.email, creds.password);
      onLogin();
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    marginTop: "6px",
    padding: "10px 14px",
    background: G.charcoal,
    border: `1px solid rgba(255,255,255,0.1)`,
    color: G.textDark,
    fontSize: "14px",
    fontFamily: "'Jost', sans-serif",
    borderRadius: "2px",
    transition: "border-color 0.3s",
  };

  const labelStyle = {
    fontSize: "11px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: G.textMuted,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: G.carbon,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <div
        style={{
          background: "#1A1A1A",
          border: `1px solid ${G.gold}30`,
          padding: "48px",
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <p
          style={{
            color: G.gold,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "28px",
            marginBottom: "4px",
          }}
        >
          Dorella Jewelry
        </p>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: G.textMuted,
            marginBottom: "32px",
          }}
        >
          Panel Administrativo
        </p>

        {/* Email */}
        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={creds.email}
            autoComplete="email"
            onChange={(e) => setCreds((c) => ({ ...c, email: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = G.gold}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        {/* Contraseña */}
        <div style={{ marginBottom: "24px", textAlign: "left" }}>
          <label style={labelStyle}>Contraseña</label>
          <input
            type="password"
            value={creds.password}
            autoComplete="current-password"
            onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = G.gold}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        {error && (
          <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "16px" }}>{error}</p>
        )}

        <button
          className="gold-btn"
          style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}
