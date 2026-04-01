import Link from "next/link";
import { ASSET_ALLOCATION, UNDERLYING_ETFS, TOP_HOLDINGS } from "@/lib/constants";

export default function InsideVeqtPreview() {
  return (
    <section className="py-10">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
        What&apos;s inside VEQT?
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        One ETF, four underlying funds, 13,500+ stocks across the globe.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Geography Allocation */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">
            Geography Allocation
          </h3>

          {/* Horizontal stacked bar */}
          <div className="flex rounded-full overflow-hidden h-4 mb-4">
            {ASSET_ALLOCATION.map((a) => (
              <div
                key={a.name}
                style={{ width: `${a.value}%`, backgroundColor: a.color }}
                className="first:rounded-l-full last:rounded-r-full"
                title={`${a.name}: ${a.value}%`}
              />
            ))}
          </div>

          <div className="space-y-1.5">
            {ASSET_ALLOCATION.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: a.color }}
                  />
                  <span className="text-[var(--color-text-muted)]">{a.name}</span>
                </div>
                <span className="font-medium tabular-nums">{a.value}%</span>
              </div>
            ))}
          </div>

          <Link
            href="/inside-veqt"
            className="inline-block mt-4 text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
          >
            See full breakdown &rarr;
          </Link>
        </div>

        {/* Underlying ETFs */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">
            Underlying ETFs
          </h3>

          <div className="space-y-2.5">
            {UNDERLYING_ETFS.map((etf) => (
              <div key={etf.ticker} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {etf.ticker}
                  </span>
                  <span className="text-[var(--color-text-muted)] ml-1.5">
                    {etf.name}
                  </span>
                </div>
                <span className="font-medium tabular-nums text-[var(--color-text-muted)]">
                  {etf.weight}%
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/inside-veqt"
            className="inline-block mt-4 text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
          >
            See full breakdown &rarr;
          </Link>
        </div>

        {/* Top Holdings */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">
            Top Holdings
          </h3>

          <div className="space-y-2.5">
            {TOP_HOLDINGS.map((h, i) => (
              <div key={h.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-muted)] w-4">{i + 1}.</span>
                  <span className="text-[var(--color-text-primary)]">{h.name}</span>
                </div>
                <span className="font-medium tabular-nums text-[var(--color-text-muted)]">
                  {h.weight}%
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/inside-veqt"
            className="inline-block mt-4 text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
          >
            See full breakdown &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
