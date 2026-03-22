import Link from "next/link";
import { LATEST_DISTRIBUTION } from "@/lib/constants";

export default function SidebarCards() {
  return (
    <div className="flex flex-col gap-4">
      {/* Latest Distribution */}
      <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
          Latest Distribution
        </h3>
        <p className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
          {LATEST_DISTRIBUTION.amount}
          <span className="text-xs font-normal text-[var(--color-text-muted)] ml-1">
            per unit
          </span>
        </p>
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Ex-dividend</span>
            <span>{LATEST_DISTRIBUTION.exDivDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Payable</span>
            <span>{LATEST_DISTRIBUTION.payableDate}</span>
          </div>
        </div>
        <Link
          href="/distributions"
          className="inline-block mt-3 text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          Full history &rarr;
        </Link>
      </div>

      {/* Quick Compare */}
      <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
          Quick Compare
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          How does VEQT compare to XEQT and ZEQT?
        </p>
        <Link
          href="/compare"
          className="inline-flex items-center text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          See comparison &rarr;
        </Link>
      </div>

      {/* Why VEQT */}
      <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
          Why investors choose VEQT
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-brand)] mt-0.5">&#x2713;</span>
            One-ticket global diversification
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-brand)] mt-0.5">&#x2713;</span>
            0.24% MER — low cost
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-brand)] mt-0.5">&#x2713;</span>
            Automatic rebalancing
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-brand)] mt-0.5">&#x2713;</span>
            100% equity for long-term growth
          </li>
        </ul>
      </div>
    </div>
  );
}
