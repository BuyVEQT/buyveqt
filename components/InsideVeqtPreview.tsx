import Link from "next/link";
import { ASSET_ALLOCATION, UNDERLYING_ETFS, TOP_HOLDINGS } from "@/lib/constants";

export default function InsideVeqtPreview() {
  return (
    <section className="py-12">
      <p className="section-label mb-2">Composition</p>
      <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)] mb-1.5">
        What&apos;s inside VEQT?
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        One ETF, four underlying funds, 13,700+ stocks across the globe.
      </p>

      {/* Asymmetric grid: geography gets 2 cols on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Geography Allocation — wider for visual weight */}
        <div className="card-editorial p-5 lg:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
            Geography Allocation
          </h3>

          <div className="flex rounded-full overflow-hidden h-3 mb-4">
            {ASSET_ALLOCATION.map((a) => (
              <div
                key={a.name}
                style={{ width: `${a.value}%`, backgroundColor: a.color }}
                className="first:rounded-l-full last:rounded-r-full"
                title={`${a.name}: ${a.value}%`}
              />
            ))}
          </div>

          <div className="space-y-2">
            {ASSET_ALLOCATION.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: a.color }}
                  />
                  <span className="text-[var(--color-text-muted)]">{a.name}</span>
                </div>
                <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">{a.value}%</span>
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
        <div className="card-editorial p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
            Underlying ETFs
          </h3>

          <div className="space-y-3">
            {UNDERLYING_ETFS.map((etf) => (
              <div key={etf.ticker} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {etf.ticker}
                  </span>
                  <span className="text-[var(--color-text-muted)] ml-1.5 text-xs">
                    {etf.name}
                  </span>
                </div>
                <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
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
        <div className="card-editorial p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
            Top Holdings
          </h3>

          <div className="space-y-3">
            {TOP_HOLDINGS.map((h, i) => (
              <div key={h.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-semibold text-[var(--color-accent)] w-4 tabular-nums">{i + 1}.</span>
                  <span className="text-[var(--color-text-primary)]">{h.name}</span>
                </div>
                <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
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
