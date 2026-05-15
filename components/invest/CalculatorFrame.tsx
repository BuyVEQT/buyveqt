import type { ReactNode } from "react";

interface CalculatorFrameProps {
  stamp: string;    // e.g. "Lookback"
  title: string;    // e.g. "What it would have been"
  children: ReactNode;
}

/**
 * Broadsheet-styled header above each calculator. The subhead has moved
 * up to the tab-row level (in CalculatorTabs) so it acts as the active
 * tab's caption rather than getting buried below the frame's title.
 */
export default function CalculatorFrame({
  stamp,
  title,
  children,
}: CalculatorFrameProps) {
  return (
    <section className="mt-6 sm:mt-8 pt-6 border-t-2 border-[var(--ink)]">
      <p className="bs-stamp mb-3">{stamp}</p>
      <h2
        className="bs-display text-[1.5rem] sm:text-[2rem] mb-6"
        style={{ color: "var(--ink)" }}
      >
        {title}
      </h2>

      <div>{children}</div>
    </section>
  );
}
