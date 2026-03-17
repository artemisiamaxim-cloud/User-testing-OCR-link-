import React from "react";

type TextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
type TextColor = "default" | "placeholder" | "onDark";
type FontWeight = "regular" | "medium" | "semiBold" | "bold";
type LineHeight = "none" | "normal" | "tight";

interface TextProps {
  size?: TextSize;
  fontWeight?: FontWeight;
  color?: TextColor;
  lineHeight?: LineHeight;
  align?: "left" | "center" | "right";
  element?: "p" | "span" | "div" | "label";
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

const sizeMap: Record<TextSize, string> = {
  xs: "var(--typography-fontSize-xs)",
  sm: "var(--typography-fontSize-sm)",
  base: "var(--typography-fontSize-md)",
  lg: "var(--typography-fontSize-lg)",
  xl: "var(--typography-fontSize-xl)",
  "2xl": "var(--typography-fontSize-2xl)",
};

const weightMap: Record<FontWeight, number> = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

const colorMap: Record<TextColor, string> = {
  default: "var(--palette-content-neutral-strong)",
  placeholder: "var(--palette-content-neutral-subtle)",
  onDark: "var(--palette-content-neutral-onInverse)",
};

const lineHeightMap: Record<LineHeight, number | string> = {
  none: 1,
  normal: 1.5,
  tight: 1.2,
};

export const Text = ({
  size = "base",
  fontWeight = "regular",
  color = "default",
  lineHeight = "normal",
  align,
  element: Tag = "span",
  id,
  className,
  children,
}: TextProps) => {
  return (
    <Tag
      id={id}
      className={className}
      style={{
        fontSize: sizeMap[size],
        fontWeight: weightMap[fontWeight],
        color: colorMap[color],
        lineHeight: lineHeightMap[lineHeight],
        textAlign: align,
        margin: 0,
      }}
    >
      {children}
    </Tag>
  );
};
