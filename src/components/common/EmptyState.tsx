interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div style={styles.card}>
      <div style={styles.iconCircle}>{icon}</div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={styles.actionBtn}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "48px 24px",
    border: "1px solid #eef2ef",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
  },
  iconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    backgroundColor: "#f7f9f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    marginBottom: "16px",
    border: "1px solid #e2e8f0",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 6px 0",
  },
  description: {
    fontSize: "14px",
    color: "#64748b",
    maxWidth: "420px",
    margin: "0 0 20px 0",
    lineHeight: 1.5,
  },
  actionBtn: {
    padding: "12px 24px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(46, 125, 72, 0.2)",
    cursor: "pointer",
  },
}
