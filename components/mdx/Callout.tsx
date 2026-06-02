import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "tip";

const SVG = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  style: { flexShrink: 0 },
};

// Token-driven SVG marks replace the previous clip-art emoji (no emoji per
// the editorial house style). Each inherits its callout's accent via
// stroke="currentColor" on the parent <p> color.
const ICONS: Record<CalloutType, ReactNode> = {
  info: (
    <svg {...SVG}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="7.75" x2="12.01" y2="7.75" />
    </svg>
  ),
  warning: (
    <svg {...SVG}>
      <path d="M10.29 4.1 2.42 18a1.5 1.5 0 0 0 1.3 2.25h16.56a1.5 1.5 0 0 0 1.3-2.25L13.71 4.1a1.5 1.5 0 0 0-2.42 0z" />
      <line x1="12" y1="9.5" x2="12" y2="14" />
      <line x1="12" y1="17.5" x2="12.01" y2="17.5" />
    </svg>
  ),
  tip: (
    <svg {...SVG}>
      <path d="M9 18h6" />
      <path d="M10 21.5h4" />
      <path d="M15.1 14c.2-1 .7-1.75 1.45-2.5A4.65 4.65 0 0 0 18 8 6 6 0 1 0 6 8c0 1 .25 2.25 1.45 3.5.75.75 1.25 1.5 1.45 2.5" />
    </svg>
  ),
};

interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
}

const config: Record<
  CalloutType,
  { label: string; borderColor: string; bg: string }
> = {
  info: {
    label: "Good to know",
    borderColor: "#2563eb",
    bg: "rgba(37, 99, 235, 0.06)",
  },
  warning: {
    label: "Watch out",
    borderColor: "var(--color-chart-orange)",
    bg: "rgba(217, 119, 6, 0.06)",
  },
  tip: {
    label: "Pro tip",
    borderColor: "#16a34a",
    bg: "rgba(22, 163, 74, 0.06)",
  },
};

const darkBg: Record<CalloutType, string> = {
  info: "rgba(37, 99, 235, 0.10)",
  warning: "rgba(217, 119, 6, 0.10)",
  tip: "rgba(22, 163, 74, 0.10)",
};

export function Callout({ type = "info", children }: CalloutProps) {
  const c = config[type];

  return (
    <aside
      className="callout rounded-lg border-l-4 p-4 my-5"
      style={
        {
          borderLeftColor: c.borderColor,
          "--callout-bg": c.bg,
          "--callout-bg-dark": darkBg[type],
          backgroundColor: "var(--callout-bg)",
        } as React.CSSProperties
      }
    >
      <p
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: c.borderColor }}
      >
        {ICONS[type]}
        {c.label}
      </p>
      <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed [&>p]:mb-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
