"use client";

const BROKERS = [
  { name: "Plus500", loss: 82 },
  { name: "XTB", loss: 79 },
  { name: "CMC Markets", loss: 78 },
  { name: "Pepperstone", loss: 77 },
  { name: "eToro", loss: 76 },
  { name: "OANDA", loss: 76 },
  { name: "IG Markets", loss: 75 },
  { name: "FXCM", loss: 74 },
  { name: "Saxo Bank", loss: 72 },
  { name: "Interactive Brokers", loss: 65 },
] as const;

const AVG_LOSS = (
  BROKERS.reduce((sum, b) => sum + b.loss, 0) / BROKERS.length
).toFixed(1);

export function ForexLossStats() {
  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Retail Forex Account Loss Rates by Broker
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        ESMA-mandated disclosures show consistent losses across every broker.
      </p>

      {/* Bars */}
      <div className="space-y-2.5">
        {BROKERS.map((b) => (
          <div key={b.name} className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-muted)] w-[110px] sm:w-[130px] shrink-0 text-right truncate">
              {b.name}
            </span>
            <div className="flex-1 h-5 rounded-sm bg-[var(--color-base)] overflow-hidden">
              <div
                className="h-full rounded-sm transition-all"
                style={{
                  width: `${b.loss}%`,
                  backgroundColor:
                    b.loss >= 80
                      ? "var(--color-negative)"
                      : b.loss >= 75
                        ? "#d97706"
                        : "#d97706",
                  opacity: b.loss >= 80 ? 0.85 : 0.65,
                }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums text-[var(--color-negative)] w-10 text-right shrink-0">
              {b.loss}%
            </span>
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Avg. Retail Loss Rate
          </p>
          <p className="text-xl font-bold tabular-nums text-[var(--color-negative)]">
            {AVG_LOSS}%
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            across all brokers
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Positive 15Y Periods
          </p>
          <p className="text-xl font-bold tabular-nums text-[var(--color-positive)]">
            100%
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            global equities, any 15+ yr span
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[var(--color-text-muted)]">
        Data from ESMA-mandated broker disclosures (2018-present). Loss rates
        represent percentage of retail investor accounts that lose money when
        trading CFDs/forex with each provider.
      </p>
    </div>
  );
}
