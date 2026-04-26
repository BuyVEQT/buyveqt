"use client";

export function OwnershipStructure() {
  return (
    <div className="my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8">
      {/* Header band */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: "#c4122f" }}>
          Structural Difference
        </p>
        <h3 className="text-2xl sm:text-3xl font-serif text-[var(--color-text-primary)]">
          Same product. Different owners.
        </h3>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Vanguard side */}
        <div>
          <div className="flex items-start gap-2 mb-4">
            <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: "#c4122f" }} />
            <div>
              <p className="text-base font-semibold text-[var(--color-text-primary)]">Vanguard</p>
              <p className="text-xs text-[var(--color-text-muted)]">Investor-owned</p>
            </div>
          </div>

          {/* Flow: You → Vanguard Funds → Vanguard (the company) ↻ */}
          <div className="relative flex flex-col items-center">
            {/* Box 1: You */}
            <div className="w-full rounded-md border border-[var(--color-border)] px-4 py-3 text-center">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">You</p>
            </div>

            {/* Arrow down: owns */}
            <div className="flex flex-col items-center my-1">
              <div className="w-0.5 h-3" style={{ backgroundColor: "#c4122f" }} />
              <p className="text-[10px] uppercase tracking-wider font-medium my-0.5" style={{ color: "#c4122f" }}>owns</p>
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path d="M5 7L0 0h10z" fill="#c4122f" />
              </svg>
            </div>

            {/* Box 2: Vanguard Funds */}
            <div className="w-full rounded-md border border-[var(--color-border)] px-4 py-3 text-center">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Vanguard Funds</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">VEQT, VUN, etc.</p>
            </div>

            {/* Arrow down: own */}
            <div className="flex flex-col items-center my-1">
              <div className="w-0.5 h-3" style={{ backgroundColor: "#c4122f" }} />
              <p className="text-[10px] uppercase tracking-wider font-medium my-0.5" style={{ color: "#c4122f" }}>own</p>
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path d="M5 7L0 0h10z" fill="#c4122f" />
              </svg>
            </div>

            {/* Box 3: Vanguard (the company) */}
            <div className="w-full rounded-md border px-4 py-3 text-center" style={{ borderColor: "#c4122f", borderStyle: "dashed" }}>
              <p className="text-sm font-semibold" style={{ color: "#c4122f" }}>Vanguard (the company)</p>
            </div>

            {/* Loop-back SVG: from bottom of box 3, around the left, up to top of box 1 */}
            <div className="relative w-full mt-1" style={{ height: 48 }}>
              {/* SVG loop arrow from company back to you */}
              <svg
                width="100%"
                height="48"
                viewBox="0 0 200 48"
                preserveAspectRatio="none"
                overflow="visible"
              >
                {/* Curved path: start bottom-center, go left+down, loop back up to top-center */}
                <path
                  d="M 100 0 Q 20 24 100 48"
                  fill="none"
                  stroke="#c4122f"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Arrow head pointing up at end */}
                <path d="M 100 48 L 95 38 M 100 48 L 105 38" fill="none" stroke="#c4122f" strokeWidth="1.5" />
              </svg>
              <p className="absolute inset-0 flex items-center justify-center text-[10px] font-medium uppercase tracking-wider" style={{ color: "#c4122f" }}>
                loops back
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] mt-3">
            The loop closes. Investors own the funds; the funds own the company. Fee cuts benefit investors directly — there are no outside shareholders to satisfy.
          </p>
        </div>

        {/* BlackRock side */}
        <div>
          <div className="flex items-start gap-2 mb-4">
            <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: "#1a6dca" }} />
            <div>
              <p className="text-base font-semibold text-[var(--color-text-primary)]">BlackRock</p>
              <p className="text-xs text-[var(--color-text-muted)]">Public company (NYSE: BLK)</p>
            </div>
          </div>

          {/* Flow: You → iShares Funds → BlackRock Inc. → BLK Shareholders */}
          <div className="flex flex-col items-center">
            {/* Box 1: You */}
            <div className="w-full rounded-md border border-[var(--color-border)] px-4 py-3 text-center">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">You</p>
            </div>

            {/* Arrow down: owns */}
            <div className="flex flex-col items-center my-1">
              <div className="w-0.5 h-3" style={{ backgroundColor: "#1a6dca" }} />
              <p className="text-[10px] uppercase tracking-wider font-medium my-0.5" style={{ color: "#1a6dca" }}>owns</p>
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path d="M5 7L0 0h10z" fill="#1a6dca" />
              </svg>
            </div>

            {/* Box 2: iShares Funds */}
            <div className="w-full rounded-md border border-[var(--color-border)] px-4 py-3 text-center">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">iShares Funds</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">XEQT, XIC, etc.</p>
            </div>

            {/* Arrow down: managed by */}
            <div className="flex flex-col items-center my-1">
              <div className="w-0.5 h-3" style={{ backgroundColor: "#1a6dca" }} />
              <p className="text-[10px] uppercase tracking-wider font-medium my-0.5" style={{ color: "#1a6dca" }}>managed by</p>
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path d="M5 7L0 0h10z" fill="#1a6dca" />
              </svg>
            </div>

            {/* Box 3: BlackRock Inc. */}
            <div className="w-full rounded-md border px-4 py-3 text-center" style={{ borderColor: "#1a6dca", borderStyle: "dashed" }}>
              <p className="text-sm font-semibold" style={{ color: "#1a6dca" }}>BlackRock Inc.</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">NYSE: BLK</p>
            </div>

            {/* Fork: arrow down + right to BLK Shareholders */}
            <div className="w-full flex items-start gap-2 mt-1">
              <div className="flex-1 flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-3" style={{ backgroundColor: "#1a6dca" }} />
                  <p className="text-[10px] uppercase tracking-wider font-medium my-0.5" style={{ color: "#1a6dca" }}>fees flow to</p>
                  <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                    <path d="M5 7L0 0h10z" fill="#1a6dca" />
                  </svg>
                </div>
              </div>
            </div>

            {/* BLK Shareholders box */}
            <div className="w-full rounded-md border px-4 py-3 text-center mt-0" style={{ borderColor: "#1a6dca", backgroundColor: "rgba(26,109,202,0.06)" }}>
              <p className="text-sm font-semibold" style={{ color: "#1a6dca" }}>BLK Shareholders</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">via dividends & buybacks</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] mt-3">
            The chain forks. Profits split between fund investors and BLK shareholders. Leadership balances your interest against Wall Street&apos;s.
          </p>
        </div>
      </div>

      {/* CEO disclosure footer band */}
      <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-muted)] mb-4">
          One concrete consequence
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1">BlackRock CEO, 2025</p>
            <p className="text-xl font-bold tabular-nums text-[var(--color-text-primary)]">$37,700,000</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">publicly disclosed</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1">Vanguard CEO, 2025</p>
            <p className="text-xl font-bold tabular-nums text-[var(--color-text-muted)]">Not disclosed</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">no outside shareholders to disclose to</p>
          </div>
        </div>
      </div>
    </div>
  );
}
