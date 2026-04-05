"use client";

const EVENTS = [
  {
    date: "1976",
    title: "First index fund",
    description:
      "Bogle launches the First Index Investment Trust. Wall Street calls it \"Bogle's Folly.\"",
    type: "vanguard" as const,
  },
  {
    date: "2018",
    title: "Asset allocation ETFs",
    description:
      "Vanguard launches VCNS, VBAL, VGRO in Canada — single-ticket portfolios for Canadian investors.",
    type: "vanguard" as const,
  },
  {
    date: "Jan 2019",
    title: "VEQT launches",
    description:
      "The first all-equity, single-ticket global ETF for Canadians. MER: 0.24%.",
    type: "vanguard" as const,
  },
  {
    date: "Aug 2019",
    title: "XEQT follows",
    description:
      "BlackRock launches XEQT seven months later. MER: 0.20%.",
    type: "response" as const,
  },
  {
    date: "2022",
    title: "ZEQT arrives",
    description: "BMO launches its own all-equity ETF, further validating the category Vanguard created.",
    type: "response" as const,
  },
  {
    date: "Nov 2025",
    title: "Vanguard cuts fees",
    description:
      "VEQT management fee drops from 0.22% to 0.17%. Effective MER expected ~0.20%.",
    type: "vanguard" as const,
  },
  {
    date: "Dec 2025",
    title: "BlackRock matches",
    description:
      "XEQT management fee cut from 0.18% to 0.17% — within weeks of Vanguard's move.",
    type: "response" as const,
  },
];

export function VanguardEffectTimeline() {
  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        The Vanguard Effect in Action
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Vanguard leads, the industry follows. This pattern has repeated for 50
        years.
      </p>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5 text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--color-positive)" }}
          />
          <span className="text-[var(--color-text-secondary)]">
            Vanguard leads
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--color-text-muted)" }}
          />
          <span className="text-[var(--color-text-secondary)]">
            Industry follows
          </span>
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {EVENTS.map((event, i) => {
          const isVanguard = event.type === "vanguard";
          const dotColor = isVanguard
            ? "var(--color-positive)"
            : "var(--color-text-muted)";
          const isLast = i === EVENTS.length - 1;

          return (
            <div key={i} className="flex gap-4 relative">
              {/* Line + dot */}
              <div className="flex flex-col items-center shrink-0 w-5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                  style={{ backgroundColor: dotColor }}
                />
                {!isLast && (
                  <div className="w-px flex-1 bg-[var(--color-border)]" />
                )}
              </div>

              {/* Content */}
              <div className="pb-5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-bold tabular-nums text-[var(--color-text-muted)]">
                    {event.date}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {event.title}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom callout */}
      <div className="mt-2 rounded-md bg-[var(--color-base)] border border-[var(--color-border)] p-3">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <strong className="text-[var(--color-text-primary)]">
            The pattern:
          </strong>{" "}
          Vanguard enters a market or cuts fees. Competitors follow to stay
          competitive. If XEQT&apos;s fees are low today, it&apos;s in large part
          because Vanguard forced that outcome.
        </p>
      </div>
    </div>
  );
}
