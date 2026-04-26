"use client";

export function OwnershipStructure() {
  return (
    <div className="my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-10">
      {/* Header band */}
      <div className="mb-8 sm:mb-10">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: "#c4122f" }}>
          Structural Difference
        </p>
        <h3 className="text-2xl sm:text-3xl font-serif text-[var(--color-text-primary)]">
          Same product. Different owners.
        </h3>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
        {/* Vanguard column */}
        <div className="text-center sm:text-left">
          {/* Icon */}
          <div
            className="text-[56px] sm:text-[72px] leading-none mb-4 select-none"
            style={{ color: "#c4122f" }}
          >
            ↻
          </div>

          {/* Brand label + subtitle */}
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-text-primary)]">
            Vanguard
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-5">
            Investor-owned
          </p>

          {/* Body lines */}
          <p className="text-base leading-relaxed text-[var(--color-text-primary)]">
            Owned by its own funds.
          </p>
          <p className="text-base leading-relaxed text-[var(--color-text-primary)] mt-1">
            The funds are owned by you.
          </p>

          {/* Thin divider */}
          <div className="my-5 border-t border-[var(--color-border)] mx-auto sm:mx-0" style={{ width: "60px" }} />

          {/* Punch line */}
          <p className="text-base sm:text-lg font-serif italic text-[var(--color-text-primary)]">
            <span className="font-bold not-italic" style={{ color: "#c4122f" }}>One</span> set of interests.
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Cut fees → save investors.
          </p>
        </div>

        {/* BlackRock column */}
        <div className="text-center sm:text-left">
          {/* Icon */}
          <div
            className="text-[56px] sm:text-[72px] leading-none mb-4 select-none"
            style={{ color: "#1a6dca" }}
          >
            ⤴
          </div>

          {/* Brand label + subtitle */}
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-text-primary)]">
            BlackRock
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-5">
            Public company · NYSE: BLK
          </p>

          {/* Body lines */}
          <p className="text-base leading-relaxed text-[var(--color-text-primary)]">
            Owned by outside shareholders.
          </p>
          <p className="text-base leading-relaxed text-[var(--color-text-primary)] mt-1">
            You are the customer, not the owner.
          </p>

          {/* Thin divider */}
          <div className="my-5 border-t border-[var(--color-border)] mx-auto sm:mx-0" style={{ width: "60px" }} />

          {/* Punch line */}
          <p className="text-base sm:text-lg font-serif italic text-[var(--color-text-primary)]">
            <span className="font-bold not-italic" style={{ color: "#1a6dca" }}>Two</span> sets of interests.
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Cut fees → lose to BLK shareholders.
          </p>
        </div>
      </div>
    </div>
  );
}
