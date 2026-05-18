import type { ReactNode, CSSProperties } from "react";

interface LedeProps {
  dark?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Lede expects a plain string so the drop cap floats on the first char. */
  children: ReactNode;
}

export default function Lede({
  dark = false,
  className = "",
  style,
  children,
}: LedeProps) {
  return (
    <p
      className={`ed-body ed-lede ${className}`}
      style={{
        color: dark ? "rgba(246, 239, 220, 0.85)" : "var(--ink-soft)",
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
}
