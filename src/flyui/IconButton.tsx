import React from "react";

type FlyIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface IconButtonProps {
  variant?: "Primary" | "Secondary" | "Tertiary";
  size?: "auto" | "sm" | "md" | "lg";
  Icon: FlyIcon;
  iconSize?: number;
  accessibilityLabel: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const IconButton = ({
  variant = "Tertiary",
  Icon,
  iconSize = 16,
  accessibilityLabel,
  onClick,
  disabled,
}: IconButtonProps) => {
  const bgMap: Record<string, string> = {
    Primary: "var(--palette-bg-accent-strong)",
    Secondary: "var(--palette-bg-neutral-subtle)",
    Tertiary: "transparent",
  };

  return (
    <button
      aria-label={accessibilityLabel}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: variant === "Secondary" ? "1px solid var(--palette-border-neutral-subtle)" : "none",
        backgroundColor: bgMap[variant],
        color: variant === "Primary" ? "white" : "var(--palette-content-neutral-strong)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        padding: 0,
        flexShrink: 0,
      }}
    >
      <Icon style={{ width: iconSize, height: iconSize }} />
    </button>
  );
};
