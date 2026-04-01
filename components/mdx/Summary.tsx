import type { ReactNode } from "react";

interface SummaryProps {
  children: ReactNode;
  label?: string;
}

export function Summary({ children, label = "Key Takeaway" }: SummaryProps) {
  return (
    <aside
      className="rounded-lg border-l-4 border-l-[var(--color-brand)] p-5 my-6"
      style={{ backgroundColor: "var(--color-card)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-2">
        {label}
      </p>
      <div className="text-[var(--color-text-secondary)] font-medium leading-relaxed [&>p]:mb-0">
        {children}
      </div>
    </aside>
  );
}
