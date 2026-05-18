import type { ReactNode, CSSProperties } from "react";
import SectionLabel from "./SectionLabel";

export type SectionHeadSize = "sm" | "md" | "lg" | "xl";

interface SectionHeadProps {
  kicker?: ReactNode;
  title: ReactNode;
  size?: SectionHeadSize;
  italic?: boolean;
  dark?: boolean;
  className?: string;
  style?: CSSProperties;
}

const SIZE_PX: Record<SectionHeadSize, number> = {
  sm: 20,
  md: 26,
  lg: 34,
  xl: 44,
};

export default function SectionHead({
  kicker,
  title,
  size = "md",
  italic = true,
  dark = false,
  className = "",
  style,
}: SectionHeadProps) {
  return (
    <div className={className} style={style}>
      {kicker && <SectionLabel dark={dark}>{kicker}</SectionLabel>}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontStyle: italic ? "italic" : "normal",
          fontSize: SIZE_PX[size],
          lineHeight: 1.05,
          letterSpacing: "-0.018em",
          marginTop: kicker ? 6 : 0,
          color: dark ? "var(--paper)" : "var(--ink)",
        }}
      >
        {title}
      </div>
    </div>
  );
}
