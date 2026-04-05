"use client";

export function OwnershipStructure() {
  return (
    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Vanguard card */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--color-positive)" }}
          />
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            Vanguard — Mutual Ownership
          </p>
        </div>

        {/* Flow diagram */}
        <div className="space-y-2 mb-4">
          <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-border)] px-3 py-2 text-center">
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">
              You (the investor)
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-px h-3 bg-[var(--color-positive)]" />
              <svg
                width="8"
                height="6"
                viewBox="0 0 8 6"
                className="text-[var(--color-positive)]"
              >
                <path d="M4 6L0 0h8z" fill="currentColor" />
              </svg>
              <span className="text-[10px] text-[var(--color-positive)] font-medium mt-0.5">
                own
              </span>
              <svg
                width="8"
                height="6"
                viewBox="0 0 8 6"
                className="text-[var(--color-positive)] rotate-180"
              >
                <path d="M4 6L0 0h8z" fill="currentColor" />
              </svg>
              <div className="w-px h-3 bg-[var(--color-positive)]" />
            </div>
          </div>
          <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-border)] px-3 py-2 text-center">
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">
              Vanguard Funds (VEQT, VUN, etc.)
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-px h-3 bg-[var(--color-positive)]" />
              <svg
                width="8"
                height="6"
                viewBox="0 0 8 6"
                className="text-[var(--color-positive)]"
              >
                <path d="M4 6L0 0h8z" fill="currentColor" />
              </svg>
              <span className="text-[10px] text-[var(--color-positive)] font-medium mt-0.5">
                own
              </span>
              <svg
                width="8"
                height="6"
                viewBox="0 0 8 6"
                className="text-[var(--color-positive)] rotate-180"
              >
                <path d="M4 6L0 0h8z" fill="currentColor" />
              </svg>
              <div className="w-px h-3 bg-[var(--color-positive)]" />
            </div>
          </div>
          <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-positive)] border-dashed px-3 py-2 text-center">
            <p className="text-xs font-semibold text-[var(--color-positive)]">
              Vanguard (the company)
            </p>
          </div>
        </div>

        <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-border)] p-3">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <strong className="text-[var(--color-positive)]">
              Circular ownership:
            </strong>{" "}
            Investors own the funds, the funds own the company. Fee cuts benefit
            investors directly — there are no outside shareholders to satisfy.
          </p>
        </div>
      </div>

      {/* BlackRock card */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--color-text-muted)" }}
          />
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            BlackRock — Public Company
          </p>
        </div>

        {/* Flow diagram */}
        <div className="space-y-2 mb-4">
          <div className="flex gap-2">
            <div className="flex-1 rounded-md bg-[var(--color-base)] border border-[var(--color-border)] px-3 py-2 text-center">
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                You (fund investor)
              </p>
            </div>
            <div className="flex-1 rounded-md bg-[var(--color-base)] border border-[var(--color-negative)] border-dashed px-3 py-2 text-center">
              <p className="text-xs font-semibold text-[var(--color-negative)]">
                BLK shareholders
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 flex justify-center">
              <div className="flex flex-col items-center">
                <div className="w-px h-3 bg-[var(--color-text-muted)]" />
                <svg
                  width="8"
                  height="6"
                  viewBox="0 0 8 6"
                  className="text-[var(--color-text-muted)]"
                >
                  <path d="M4 6L0 0h8z" fill="currentColor" />
                </svg>
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">
                  invest in
                </span>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex flex-col items-center">
                <div className="w-px h-3 bg-[var(--color-negative)]" />
                <svg
                  width="8"
                  height="6"
                  viewBox="0 0 8 6"
                  className="text-[var(--color-negative)]"
                >
                  <path d="M4 6L0 0h8z" fill="currentColor" />
                </svg>
                <span className="text-[10px] text-[var(--color-negative)] font-medium mt-0.5">
                  own
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-md bg-[var(--color-base)] border border-[var(--color-border)] px-3 py-2 text-center">
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                iShares Funds (XEQT, XIC, etc.)
              </p>
            </div>
            <div className="flex-1 rounded-md bg-[var(--color-base)] border border-[var(--color-border)] px-3 py-2 text-center">
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                BlackRock Inc. (NYSE: BLK)
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 flex justify-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                  managed by →
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-border)] p-3">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <strong className="text-[var(--color-text-primary)]">
              Split incentives:
            </strong>{" "}
            BlackRock&apos;s leadership balances fund investor interests against
            BLK shareholder expectations for revenue growth and profit margins.
          </p>
        </div>
      </div>
    </div>
  );
}
