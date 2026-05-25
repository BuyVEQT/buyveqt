"use client";

/**
 * AnimatedDollar / AnimatedPct — tween-animated headline numbers used on
 * the dark result slabs and the smaller "sub-stats" rows.
 *
 * Mirrors the prototype's three sizes (huge / large / medium). All are
 * Fraunces 500, tabular-nums, with a negative letter-spacing to feel
 * like editorial display type rather than spreadsheet figures.
 */
import { useAnimatedNumber, useAnimatedNumberRaw } from "./useAnimatedNumber";
import { fmtCAD, fmtPct } from "@/lib/calc-data";

export type AnimatedSize = "huge" | "large" | "medium";

interface AnimatedDollarProps {
  value: number;
  size?: AnimatedSize;
  /** Defaults to 0 — set higher for sub-dollar precision. */
  fractionDigits?: number;
}

export default function AnimatedDollar({
  value,
  size = "huge",
  fractionDigits = 0,
}: AnimatedDollarProps) {
  const v = useAnimatedNumber(value);
  return (
    <span
      className={`anum anum--${size} ed-display ed-numerals`}
      /* Screen readers should hear the settled value when inputs
         change, but not every intermediate tween frame. The settled
         number lands on the next render after `value` stops changing,
         so polite + atomic gives a clean read-out. */
      aria-live="polite"
      aria-atomic="true"
    >
      {fmtCAD(v, fractionDigits)}
      <style jsx>{`
        .anum {
          font-family: var(--font-display);
          font-weight: 500;
          letter-spacing: -0.035em;
          font-variant-numeric: tabular-nums lining-nums;
          display: inline-block;
        }
        .anum--huge {
          font-size: clamp(3.4rem, 8vw, 6.4rem);
          line-height: 0.95;
        }
        .anum--large {
          font-size: clamp(1.9rem, 3.4vw, 2.6rem);
          line-height: 1;
        }
        .anum--medium {
          font-size: clamp(1.4rem, 2.4vw, 1.7rem);
          line-height: 1.05;
        }
      `}</style>
    </span>
  );
}

interface AnimatedPctProps {
  value: number;
  tone?: "auto" | "green" | "stamp" | "ink";
  digits?: number;
}

export function AnimatedPct({
  value,
  tone = "auto",
  digits = 1,
}: AnimatedPctProps) {
  const v = useAnimatedNumberRaw(value);
  let color = "var(--ink)";
  if (tone === "auto") color = v >= 0 ? "var(--green)" : "var(--stamp)";
  else if (tone === "green") color = "var(--green)";
  else if (tone === "stamp") color = "var(--stamp)";
  return (
    <span className="anum-pct ed-display ed-numerals" style={{ color }}>
      {fmtPct(v, digits)}
      <style jsx>{`
        .anum-pct {
          font-family: var(--font-display);
          font-weight: 500;
          letter-spacing: -0.025em;
          font-variant-numeric: tabular-nums lining-nums;
          font-size: clamp(1.6rem, 2.6vw, 2rem);
          line-height: 1;
          display: inline-block;
        }
      `}</style>
    </span>
  );
}
