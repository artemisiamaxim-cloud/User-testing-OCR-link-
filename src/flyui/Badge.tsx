type Status = "neutral" | "positive" | "warning" | "info" | "critical";

interface BadgeProps {
  content: string;
  status?: Status;
  hideDot?: boolean;
}

const statusStyles: Record<Status, { bg: string; color: string }> = {
  neutral: {
    bg: "var(--palette-bg-status-neutral)",
    color: "var(--palette-content-status-neutralStrong)",
  },
  positive: {
    bg: "var(--palette-bg-status-positive)",
    color: "var(--palette-content-status-positive)",
  },
  warning: {
    bg: "var(--palette-bg-status-warning)",
    color: "var(--palette-content-status-warning)",
  },
  info: {
    bg: "var(--palette-bg-status-info)",
    color: "var(--palette-content-status-info)",
  },
  critical: {
    bg: "var(--palette-bg-status-critical)",
    color: "var(--palette-content-status-critical)",
  },
};

export const Badge = ({ content, status = "neutral", hideDot = false }: BadgeProps) => {
  const styles = statusStyles[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 9999,
        backgroundColor: styles.bg,
        color: styles.color,
        fontSize: "var(--typography-fontSize-xs)",
        fontWeight: 500,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
      }}
    >
      {!hideDot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: styles.color,
            flexShrink: 0,
          }}
        />
      )}
      {content}
    </span>
  );
};
