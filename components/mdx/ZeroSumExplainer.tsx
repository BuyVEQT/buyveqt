"use client";

export function ZeroSumExplainer() {
  return (
    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Forex card */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎲</span>
          <p className="text-sm font-bold text-[var(--color-negative)]">
            Forex = Zero-Sum
          </p>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
          For every dollar won, a dollar is lost by someone else. After spreads
          and commissions, it&apos;s actually negative-sum.
        </p>
        <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-border)] p-3 font-mono text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[var(--color-positive)]">+$1</span>
            <span className="text-[var(--color-text-muted)]">winner</span>
            <span className="text-[var(--color-text-muted)]">+</span>
            <span className="text-[var(--color-negative)]">&minus;$1</span>
            <span className="text-[var(--color-text-muted)]">loser</span>
            <span className="text-[var(--color-text-muted)]">&minus;</span>
            <span className="text-[var(--color-negative)]">$0.02</span>
            <span className="text-[var(--color-text-muted)]">broker</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-negative)] font-semibold">
              = negative net result
            </span>
          </div>
        </div>
      </div>

      {/* VEQT card */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🌍</span>
          <p className="text-sm font-bold text-[var(--color-positive)]">
            VEQT = Positive-Sum
          </p>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
          You own pieces of real businesses that create value. The global economy
          grows, earnings grow, and all investors benefit.
        </p>
        <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-border)] p-3 font-mono text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[var(--color-positive)]">+$1</span>
            <span className="text-[var(--color-text-muted)]">you</span>
            <span className="text-[var(--color-text-muted)]">+</span>
            <span className="text-[var(--color-positive)]">+$1</span>
            <span className="text-[var(--color-text-muted)]">others</span>
            <span className="text-[var(--color-text-muted)]">&minus;</span>
            <span className="text-[var(--color-text-muted)]">$0.002</span>
            <span className="text-[var(--color-text-muted)]">fee</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-positive)] font-semibold">
              = everyone wins
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
