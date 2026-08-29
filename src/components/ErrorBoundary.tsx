import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Sin un boundary, cualquier error lanzado durante el render (por ejemplo una
 * query de Convex con argumentos inválidos) desmonta el árbol entero y deja la
 * pantalla en blanco, sin pista de qué falló.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Render fallido:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <span style={styles.icon}>⚠️</span>
          <h1 style={styles.title}>Algo se rompió al renderizar</h1>
          <p style={styles.desc}>
            La aplicación encontró un error inesperado. El detalle está abajo y
            también en la consola del navegador.
          </p>
          <pre style={styles.pre}>{error.message}</pre>
          <button onClick={this.handleReset} style={styles.button}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "#f7f9f7",
  },
  card: {
    maxWidth: "560px",
    width: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #fecaca",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.08)",
  },
  icon: {
    fontSize: "32px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1e293b",
    margin: "12px 0 8px 0",
  },
  desc: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 16px 0",
    lineHeight: 1.5,
  },
  pre: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "12px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowX: "auto",
    margin: "0 0 20px 0",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
};
