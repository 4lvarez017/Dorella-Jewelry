import { useState } from "react";
import { G } from "../styles/theme";
import { signIn } from "../lib/firebase";

const ADMIN_USERNAMES = {
  alex: "alex.dorellajewelry@gmail.com",
  alvarez: "alanalvarez1507@gmail.com",
  alan: "alanalvarez1507@gmail.com",
  admin: "alanalvarez1507@gmail.com",
  dorella: "alanalvarez1507@gmail.com",
};

export function AdminLogin({ onLogin }) {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const rawUser = (creds.username || "").trim();
    if (!rawUser || !creds.password) {
      setError("Ingresa tu nombre de usuario y contraseña");
      return;
    }
    setLoading(true);
    setError(null);

    // Mapeo automático de Nombre de Usuario -> Credencial de autenticación
    const lowerUser = rawUser.toLowerCase();
    const emailToUse = ADMIN_USERNAMES[lowerUser] || (rawUser.includes("@") ? rawUser : `${lowerUser}@gmail.com`);

    try {
      await signIn(emailToUse, creds.password);
      onLogin();
    } catch (_err) {
      // Si falló y el usuario ingresado fue 'alex', intentar con la otra cuenta de admin
      if (emailToUse !== "alanalvarez1507@gmail.com") {
        try {
          await signIn("alanalvarez1507@gmail.com", creds.password);
          onLogin();
          return;
        } catch (_e2) {
          // Ambos fallaron
        }
      }
      setError("Usuario o contraseña incorrectos");
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

        {/* Nombre de Usuario */}
        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label style={labelStyle}>Nombre de Usuario</label>
          <input
            type="text"
            value={creds.username}
            autoComplete="username"
            placeholder=""
            onChange={(e) => setCreds((c) => ({ ...c, username: e.target.value }))}
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
            placeholder="Tu contraseña"
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
