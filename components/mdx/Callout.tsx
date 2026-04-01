import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "tip";

interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
}

const config: Record<
  CalloutType,
  { label: string; borderColor: string; bg: string; icon: string }
> = {
  info: {
    label: "Good to know",
    borderColor: "#2563eb",
    bg: "rgba(37, 99, 235, 0.06)",
    icon: "\u2139\uFE0F",
  },
  warning: {
    label: "Watch out",
    borderColor: "#d97706",
    bg: "rgba(217, 119, 6, 0.06)",
    icon: "\u26A0\uFE0F",
  },
  tip: {
    label: "Pro tip",
    borderColor: "#16a34a",
    bg: "rgba(22, 163, 74, 0.06)",
    icon: "\u2705",
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
        className="text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: c.borderColor }}
      >
        <span className="mr-1.5">{c.icon}</span>
        {c.label}
      </p>
      <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed [&>p]:mb-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
