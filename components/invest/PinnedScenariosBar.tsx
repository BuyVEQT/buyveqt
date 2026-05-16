"use client";

import type { Handoff } from "@/lib/calculator-handoffs";
import type { PinnedScenario } from "@/lib/usePinnedScenarios";

interface PinnedScenariosBarProps {
  scenarios: PinnedScenario[];
  /** Loads a pin's params back into its calc via the same handoff pipe. */
  onLoad: (handoff: Handoff) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

/**
 * Compare bar — renders pinned scenarios as a horizontal strip between
 * the tab caption and the active calc. Each pin is a card with its
 * tab badge, a one-line input summary, the headline number, and Load
 * / Remove buttons. Hidden when the list is empty.
 *
 * "Load" reuses the existing CalculatorTabs handoff pipeline, so a
 * pinned scenario behaves identically to a freshly-built handoff.
 */
export default function PinnedScenariosBar({
  scenarios,
  onLoad,
  onRemove,
  onClear,
}: PinnedScenariosBarProps) {
  if (scenarios.length === 0) return null;

  return (
    <section
      className="mt-3 mb-2 pt-3 border-t border-[var(--color-border)]"
      aria-label="Pinned scenarios"
    >
      <div className="flex items-baseline justify-between mb-2">
        <p className="bs-stamp text-[10px]">
          Pinned scenarios &middot; {scenarios.length}
        </p>
        {scenarios.length >= 2 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] italic underline text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <ul className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {scenarios.map((s) => (
          <li
            key={s.id}
            className="shrink-0 min-w-[180px] max-w-[260px] rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span
                className="text-[9px] font-bold tracking-[0.18em] uppercase"
                style={{ color: "var(--stamp)" }}
              >
                {s.tabLabel}
              </span>
              <button
                type="button"
                onClick={() => onRemove(s.id)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-negative)] transition-colors leading-none"
                aria-label={`Remove pin for ${s.tabLabel} ${s.label}`}
                title="Remove"
              >
                ×
              </button>
            </div>
            <p
              className="text-[1rem] font-semibold tabular-nums leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              {s.highlight}
            </p>
            <p
              className="text-[11px] leading-tight mt-1 truncate"
              style={{ color: "var(--color-text-muted)" }}
              title={s.label}
            >
              {s.label}
            </p>
            <button
              type="button"
              onClick={() =>
                onLoad({
                  tab: s.tab,
                  params: s.params,
                  ctaLabel: "",
                })
              }
              className="mt-2 text-[11px] italic underline text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Load &rarr;
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
