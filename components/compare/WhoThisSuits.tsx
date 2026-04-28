"use client";

import { FUNDS } from "@/data/funds";

interface WhoThisSuitsProps {
  selectedFunds: string[];
}

/**
 * "The Suitability Cards" — re-styled as a numbered Letters-list, the same
 * vocabulary as the home Letters and Community feed. Each fund gets its
 * dispatch number, a display-italic name, the provider as italic caption,
 * and the curated "who this suits" body in the broadsheet body face.
 */
export default function WhoThisSuits({ selectedFunds }: WhoThisSuitsProps) {
  return (
    <section
      className="border-t-2 border-[var(--ink)] pt-5"
      aria-labelledby="suits-heading"
    >
      <header className="mb-4">
        <p id="suits-heading" className="bs-stamp mb-1">
          The Suitability
        </p>
        <h2
          className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-tight"
          style={{ color: "var(--ink)" }}
        >
          <em>Who each fund</em> is for
        </h2>
      </header>

      <ol className="space-y-0">
        {selectedFunds.map((ticker, idx) => {
          const fund = FUNDS[ticker];
          if (!fund) return null;
          const isVeqt = ticker === "VEQT.TO";
          const dispatchNumber = String(idx + 1).padStart(2, "0");
          return (
            <li
              key={ticker}
              className={`py-5 grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-6 gap-y-2 items-start ${
                idx === 0 ? "border-t border-[var(--color-border)]" : "border-t border-[var(--color-border)]"
              }`}
            >
              <span
                className="bs-display bs-numerals text-2xl sm:text-3xl leading-none pt-1"
                style={{
                  color: isVeqt ? "var(--stamp)" : "var(--ink-soft)",
                }}
              >
                {dispatchNumber}
              </span>

              <div className="min-w-0">
                <h3
                  className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-[1.15]"
                  style={{
                    color: isVeqt ? "var(--stamp)" : "var(--ink)",
                  }}
                >
                  {fund.shortName}
                </h3>
                <p
                  className="bs-caption italic mt-1 text-[11.5px]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {fund.provider}
                  <span className="opacity-50 mx-2">·</span>
                  {fund.numberOfHoldings.toLocaleString("en-CA")} holdings
                  <span className="opacity-50 mx-2">·</span>
                  {fund.distributionFrequency.toLowerCase()} distributions
                </p>
                <p
                  className="bs-body mt-3 text-[14px] leading-[1.55] max-w-[60ch]"
                  style={{ color: "var(--ink)" }}
                >
                  {fund.whoThisSuits}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
