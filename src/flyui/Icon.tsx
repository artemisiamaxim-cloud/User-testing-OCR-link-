import React from "react";

type IconColor = "default" | "placeholder" | "onDark" | "accent";

interface IconProps {
  size?: number;
  color?: IconColor;
  children?: React.ReactNode;
}

const colorMap: Record<IconColor, string> = {
  default: "var(--palette-content-neutral-strong)",
  placeholder: "var(--palette-content-neutral-subtle)",
  onDark: "var(--palette-content-neutral-onInverse)",
  accent: "var(--palette-bg-accent-strong)",
};

export const Icon = ({ size = 16, color = "default", children }: IconProps) => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        color: colorMap[color],
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
};
