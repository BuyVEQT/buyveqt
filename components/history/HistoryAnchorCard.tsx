import type { HistoryAnchor } from "@/lib/veqt-history";

interface HistoryAnchorCardProps {
  anchor: HistoryAnchor;
  longform?: string;
}

/**
 * One anchor expanded into a longform card. Stacked vertically below
 * the sticky hero on desktop (the takedown reading after the show);
 * also stacked on mobile as the primary anchor presentation.
 */
export default function HistoryAnchorCard({
  anchor,
  longform,
}: HistoryAnchorCardProps) {
  return (
    <article className="py-8 border-t-2 border-[var(--ink)] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
      <header className="lg:col-span-4">
        <p
          className="bs-stamp mb-2"
          style={{ color: "var(--ink-soft)" }}
        >
          {anchor.date.slice(0, 7)}
        </p>
        <h2
          className="bs-display text-[1.625rem] sm:text-[2rem] leading-[1.1] mb-3"
          style={{ color: "var(--ink)" }}
        >
          {anchor.label}
        </h2>
        <p
          className="bs-numerals tabular-nums text-[1.5rem]"
          style={{ color: "var(--ink)" }}
        >
          ${anchor.price.toFixed(2)}
          {anchor.drawdown !== null && (
            <span
              className="ml-3 text-[0.875rem] italic"
              style={{ color: "var(--stamp)" }}
            >
              {(anchor.drawdown * 100).toFixed(1)}%
            </span>
          )}
        </p>
      </header>
      <div className="lg:col-span-8">
        <p
          className="bs-body italic text-[1rem] sm:text-[1.0625rem] leading-[1.55] mb-4 max-w-[60ch]"
          style={{ color: "var(--ink)" }}
        >
          {anchor.note}
        </p>
        {longform && (
          <p
            className="bs-body text-[0.9375rem] sm:text-[1rem] leading-[1.6] max-w-[64ch]"
            style={{ color: "var(--ink-soft)" }}
          >
            {longform}
          </p>
        )}
      </div>
    </article>
  );
}
