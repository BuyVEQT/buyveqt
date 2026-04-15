import Link from "next/link";
import type { Distribution } from "@/data/distributions";
import { getTrailing12MonthDistributions } from "@/data/distributions";

interface DistributionCardProps {
  distribution: Distribution | null;
  /** Current VEQT price for yield computation. Pass null to hide yield. */
  currentPrice?: number | null;
}

/**
 * Compact card showing the latest confirmed distribution and trailing
 * 12-month yield. Purely informational — links to /distributions for
 * the full schedule.
 */
export default function DistributionCard({
  distribution,
  currentPrice,
}: DistributionCardProps) {
  if (!distribution) return null;

  const ttm = getTrailing12MonthDistributions();
  const yieldPct =
    currentPrice && currentPrice > 0 ? (ttm / currentPrice) * 100 : null;

  const exDate = new Date(distribution.exDate + "T00:00:00").toLocaleDateString(
    "en-CA",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <Link
      href="/distributions"
      className="block card-editorial p-5 hover:border-[var(--color-brand)]/50 transition-all group"
    >
      <p className="section-label">Latest Distribution</p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-bold tabular-nums text-[var(--color-text-primary)]">
          ${distribution.amount.toFixed(4)}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">per unit</span>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] mt-1">
        Ex-div {exDate}
      </p>

      {yieldPct !== null && (
        <p className="text-xs text-[var(--color-text-muted)] mt-3 pt-3 border-t border-[var(--color-border)]">
          Trailing 12-month yield:{" "}
          <span className="font-medium tabular-nums text-[var(--color-text-secondary)]">
            ~{yieldPct.toFixed(2)}%
          </span>
        </p>
      )}

      <span className="inline-flex items-center mt-3 text-sm font-medium text-[var(--color-brand)] group-hover:translate-x-0.5 transition-transform">
        Full schedule &rarr;
      </span>
    </Link>
  );
}
