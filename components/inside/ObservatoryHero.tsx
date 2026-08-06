"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFundInfo } from "@/lib/useFundInfo";
import { FUNDS } from "@/data/funds";
import { parseSessionDate } from "@/lib/instrument-format";

const YEAR_MS = 365.25 * 86_400_000;
const COUNT_MS = 1200;

function fmtHoldings(n: number): string {
  return n.toLocaleString("en-CA");
}

/**
 * The Observatory hero (artboard 10b) — a dot field on paper behind a
 * 140px holdings count that counts up from zero on load, then the claim:
 * "companies. One ticker."
 *
 * The dot field is honest-ish by construction: at a 14px grid over the
 * ~300px hall, one dot stands for roughly ten companies, which is exactly
 * what the kicker says. The count-up reuses the spec-strip technique from
 * the previous hero: SSR carries the final number (no hydration flash, no
 * reflow), the animation drives textContent through a ref, and reduced
 * motion / no-JS simply keep the number that is already in the markup.
 */
export default function ObservatoryHero() {
  const { data } = useFundInfo("VEQT.TO");
  const veqt = FUNDS["VEQT.TO"];

  const holdingCount = data?.holdingCount ?? veqt.numberOfHoldings;
  const holdingsValue = fmtHoldings(holdingCount);
  const aumValue = data?.aumDisplay ?? veqt.aum;
  const feeValue = veqt.managementFee.toFixed(2);

  const inception = useMemo(
    () => parseSessionDate(veqt.inceptionDate),
    [veqt.inceptionDate]
  );
  const yearsValue = useMemo(() => {
    const years = (new Date().getTime() - inception.getTime()) / YEAR_MS;
    return years.toFixed(1);
  }, [inception]);

  // ── Count-up (see docstring) ───────────────────────────────────────
  const countRef = useRef<HTMLSpanElement>(null);
  const countedRef = useRef(false);

  useEffect(() => {
    const el = countRef.current;
    if (!el) return;

    if (countedRef.current) {
      el.textContent = fmtHoldings(holdingCount);
      return;
    }
    countedRef.current = true;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const target = holdingCount;
    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      if (start === 0) start = now;
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmtHoldings(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    el.textContent = fmtHoldings(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [holdingCount]);

  return (
    <section className="ohero" aria-label="Inside VEQT">
      <h1 className="ohero__sr">
        Inside VEQT — {holdingsValue} companies, one ticker.
      </h1>

      <div className="ohero__dots" aria-hidden="true" />

      <div className="ohero__content" aria-hidden="true">
        <div className="ohero__kicker">
          <span className="ohero-desk">
            INSIDE VEQT · EVERY DOT BEHIND THIS TEXT IS ROUGHLY TEN COMPANIES
          </span>
          <span className="ohero-mob">
            INSIDE VEQT · EVERY DOT ≈ TEN COMPANIES
          </span>
        </div>

        <div className="ohero__count" suppressHydrationWarning>
          <span ref={countRef}>{holdingsValue}</span>
        </div>

        <div className="ohero__row">
          <div className="ohero__claim">
            companies. One <span className="ohero__signal">ticker.</span>
          </div>
          <div className="ohero__meta" suppressHydrationWarning>
            {aumValue} AUM · FEE {feeValue}% · {yearsValue} YRS ON TAPE
          </div>
        </div>
      </div>

      <style jsx>{`
        .ohero {
          position: relative;
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }
        .ohero__sr {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
          border: 0;
        }
        .ohero__dots {
          position: absolute;
          inset: 0 0 auto 0;
          height: 300px;
          background-image: radial-gradient(
            circle,
            rgba(17, 17, 17, 0.1) 1.4px,
            transparent 1.4px
          );
          background-size: 14px 14px;
        }
        .ohero__content {
          position: relative;
        }

        /* TRUE LABEL — the dateline kicker names the page and the dot
           field's exchange rate. Caps + the mock's 0.28em kept. */
        .ohero__kicker {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          color: var(--ins-gray-600);
        }
        .ohero-mob {
          display: none;
        }

        .ohero__count {
          margin-top: 18px;
          font-size: 140px;
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 0.85;
        }

        .ohero__row {
          display: flex;
          align-items: baseline;
          gap: 28px;
          margin-top: 14px;
        }
        .ohero__claim {
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -0.015em;
        }
        .ohero__signal {
          color: var(--ins-signal);
        }
        /* TRUE LABEL — three named figures, not a sentence. */
        .ohero__meta {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: var(--ins-gray-600);
          white-space: nowrap;
        }

        @media (max-width: 1100px) {
          .ohero__count {
            font-size: 110px;
          }
          .ohero__row {
            flex-wrap: wrap;
            gap: 12px 28px;
          }
        }

        @media (max-width: 640px) {
          .ohero__dots {
            height: 180px;
            background-image: radial-gradient(
              circle,
              rgba(17, 17, 17, 0.1) 1.2px,
              transparent 1.2px
            );
            background-size: 12px 12px;
          }
          .ohero-desk {
            display: none;
          }
          .ohero-mob {
            display: inline;
          }
          .ohero__kicker {
            letter-spacing: 0.22em;
          }
          .ohero__count {
            margin-top: 12px;
            font-size: 76px;
            letter-spacing: -0.045em;
            line-height: 0.9;
          }
          .ohero__row {
            display: block;
            margin-top: 8px;
          }
          .ohero__claim {
            font-size: 18px;
            letter-spacing: -0.01em;
          }
          .ohero__meta {
            margin-top: 8px;
            font-size: 10px;
            letter-spacing: 0.12em;
          }
        }
      `}</style>
    </section>
  );
}
