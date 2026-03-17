import React from "react";

interface HeadingProps {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  id?: string;
  children?: React.ReactNode;
}

const sizeMap = {
  xs: { fontSize: "var(--typography-fontSize-xs)", fontWeight: 600 },
  sm: { fontSize: "var(--typography-fontSize-sm)", fontWeight: 600 },
  base: { fontSize: "var(--typography-fontSize-md)", fontWeight: 600 },
  lg: { fontSize: "var(--typography-fontSize-lg)", fontWeight: 600 },
  xl: { fontSize: "var(--typography-fontSize-xl)", fontWeight: 600 },
};

export const Heading = ({ size = "base", id, children }: HeadingProps) => {
  return (
    <h2
      id={id}
      style={{
        ...sizeMap[size],
        color: "var(--palette-content-neutral-strong)",
        margin: 0,
        lineHeight: 1.2,
      }}
    >
      {children}
    </h2>
  );
};
