interface LogoProps {
  type?: "app" | "auth" | "iconOnly";
  variant?: "default" | "white";
}

export const Logo = ({ type = "app" }: LogoProps) => {
  const height = type === "auth" ? 34 : 24;
  return (
    <img
      src="/wayflyer-logo.svg"
      alt="Wayflyer"
      height={height}
      style={{ display: "block", height, width: "auto" }}
    />
  );
};
