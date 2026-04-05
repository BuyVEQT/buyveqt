import Link from "next/link";
import { COMPARISON_DATA } from "@/lib/constants";

export default function ComparePreview() {
  const headers = ["", "MER", "AUM", "Holdings", "Inception"];

  return (
    <section className="py-12">
      <div className="card-editorial p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="section-label mb-2">Comparison</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)]">
              How does VEQT stack up?
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              A quick comparison of Canada&apos;s most popular all-equity ETFs.
            </p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand)]/10 shrink-0"
          >
            Explore full comparison &rarr;
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {headers.map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-3 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.etfs.map((etf) => (
                <tr
                  key={etf.ticker}
                  className="border-b last:border-b-0 border-[var(--color-border)] hover:bg-[var(--color-card-hover)] transition-colors"
                >
                  <td className="py-3 px-3">
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {etf.ticker}
                    </span>
                    <span className="text-[var(--color-text-muted)] ml-1.5 text-xs">
                      {etf.name}
                    </span>
                  </td>
                  <td className="py-3 px-3 tabular-nums font-medium">{etf.mer}</td>
                  <td className="py-3 px-3 tabular-nums">{etf.aum}</td>
                  <td className="py-3 px-3 tabular-nums">{etf.holdings}</td>
                  <td className="py-3 px-3 text-[var(--color-text-muted)]">
                    {etf.inception}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {COMPARISON_DATA.etfs.map((etf) => (
            <div
              key={etf.ticker}
              className="rounded-lg border border-[var(--color-border)] p-4"
            >
              <p className="font-semibold text-[var(--color-text-primary)] mb-2">
                {etf.ticker}
                <span className="text-xs text-[var(--color-text-muted)] font-normal ml-1.5">
                  {etf.name}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-[var(--color-text-muted)]">MER</span>
                <span className="tabular-nums font-medium">{etf.mer}</span>
                <span className="text-[var(--color-text-muted)]">AUM</span>
                <span className="tabular-nums">{etf.aum}</span>
                <span className="text-[var(--color-text-muted)]">Holdings</span>
                <span className="tabular-nums">{etf.holdings}</span>
                <span className="text-[var(--color-text-muted)]">Inception</span>
                <span>{etf.inception}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
