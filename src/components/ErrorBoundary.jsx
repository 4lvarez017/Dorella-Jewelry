import React from "react";
import { G } from "../styles/theme";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dorella Jewelry - Error capturado en ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: G.cream || "#0D0C0B",
            color: G.textDark || "#ECE7DF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
            fontFamily: "'Jost', sans-serif",
          }}
        >
          <p
            className="serif"
            style={{
              fontSize: "32px",
              color: G.gold || "#D4AF37",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            Dorella Jewelry
          </p>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 400,
              color: G.textDark,
              marginBottom: "12px",
            }}
          >
            Estamos actualizando esta sección
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: G.textMuted || "#8A847C",
              marginBottom: "32px",
              maxWidth: "420px",
              lineHeight: 1.6,
            }}
          >
            Se ha producido una pequeña inconsistencia al cargar esta vista. Puedes regresar al catálogo o volver a la página principal.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              className="gold-btn"
              style={{
                padding: "12px 28px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                cursor: "pointer",
              }}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/?page=catalog";
              }}
            >
              Ir al Catálogo
            </button>
            <button
              style={{
                padding: "12px 28px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                background: "transparent",
                border: `1px solid ${G.creamDark || "#333"}`,
                color: G.textDark,
                cursor: "pointer",
              }}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
            >
              Inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
