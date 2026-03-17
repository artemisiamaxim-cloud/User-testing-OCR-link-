import React from "react";

interface FlexProps {
  gap?: string | number;
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  direction?: React.CSSProperties["flexDirection"];
  wrap?: React.CSSProperties["flexWrap"];
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const gapMap: Record<string, string> = {
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
};

export const Flex = ({ gap, align, justify, direction = "row", wrap, children, className, style }: FlexProps) => {
  const resolvedGap = gap !== undefined
    ? (typeof gap === "string" && gapMap[gap] ? gapMap[gap] : `${gap}px`)
    : undefined;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap: resolvedGap,
        flexWrap: wrap,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
