import { useState } from "react";
import { G } from "../styles/theme";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../data/constants";

export function AdminLogin({ onLogin }) {
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleLogin = () => {
    if (creds.email === ADMIN_EMAIL && creds.password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Credenciales incorrectas");
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
            onChange={(e) => setCreds((c) => ({ ...c, email: e.target.value }))}
            style={inputStyle}
          />
        </div>

        {/* Contraseña */}
        <div style={{ marginBottom: "24px", textAlign: "left" }}>
          <label style={labelStyle}>Contraseña</label>
          <input
            type="password"
            value={creds.password}
            onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "16px" }}>{error}</p>
        )}

        <button className="gold-btn" style={{ width: "100%" }} onClick={handleLogin}>
          Ingresar
        </button>
      </div>
    </div>
  );
}
