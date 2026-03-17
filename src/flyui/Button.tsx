import React from "react";

type FlyIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface ButtonProps {
  variant?: "Primary" | "Secondary" | "Tertiary";
  onClick?: () => void;
  iconRight?: FlyIcon;
  children?: React.ReactNode;
  disabled?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  Primary: {
    backgroundColor: "var(--palette-bg-accent-strong)",
    color: "white",
    border: "none",
  },
  Secondary: {
    backgroundColor: "var(--palette-bg-neutral-base)",
    color: "var(--palette-content-neutral-strong)",
    border: "1px solid var(--palette-border-neutral-subtle)",
  },
  Tertiary: {
    backgroundColor: "transparent",
    color: "var(--palette-content-neutral-strong)",
    border: "none",
  },
};

export const Button = ({ variant = "Primary", onClick, iconRight: IconRight, children, disabled }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variantStyles[variant],
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "0 20px",
        height: 40,
        borderRadius: 9999,
        fontSize: "var(--typography-fontSize-sm)",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      {children}
      {IconRight && <IconRight style={{ width: 16, height: 16 }} />}
    </button>
  );
};
