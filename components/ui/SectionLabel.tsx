import type { ReactNode, CSSProperties } from "react";

interface SectionLabelProps {
  dark?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function SectionLabel({
  dark = false,
  className = "",
  style,
  children,
}: SectionLabelProps) {
  return (
    <div
      className={`ed-label ${className}`}
      style={{
        color: dark ? "rgba(246, 239, 220, 0.55)" : "var(--ink-mute)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
