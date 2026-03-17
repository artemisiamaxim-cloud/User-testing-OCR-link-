import React from "react";

interface LinkProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const Link = ({ onClick, className, children }: LinkProps) => {
  return (
    <button
      className={className}
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        color: "var(--palette-bg-accent-strong)",
        cursor: "pointer",
        fontSize: "inherit",
        fontWeight: "inherit",
        textDecoration: "underline",
        lineHeight: "inherit",
      }}
    >
      {children}
    </button>
  );
};
