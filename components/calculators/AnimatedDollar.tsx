"use client";

/**
 * AnimatedDollar / AnimatedPct — tween-animated figures for the Instrument
 * calculators. Archivo 700, tabular-nums, tight tracking: the poster
 * ("huge") size is the marquee number on a calculator, "large" carries a
 * secondary headline, "medium" the ruled stat rows.
 *
 * Red is signal only: AnimatedPct prints negatives in --ins-signal and
 * everything else in ink.
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
      className={`anum anum--${size}`}
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
          font-family: var(--ins-font);
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: var(--ins-ink);
          display: inline-block;
        }
        .anum--huge {
          font-size: clamp(44px, 7.4vw, 96px);
          line-height: 0.95;
          letter-spacing: -0.04em;
        }
        .anum--large {
          font-size: clamp(24px, 3vw, 30px);
          line-height: 1;
          letter-spacing: -0.02em;
          font-weight: 600;
        }
        .anum--medium {
          font-size: clamp(16px, 2vw, 20px);
          line-height: 1.05;
          letter-spacing: -0.015em;
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
  // Instrument palette: ink by default, signal red for a loss (or when the
  // caller explicitly asks for the alarm tone).
  const negative = tone === "stamp" || (tone === "auto" && v < 0);
  return (
    <span
      className="anum-pct"
      style={{ color: negative ? "var(--ins-signal)" : "var(--ins-ink)" }}
    >
      {fmtPct(v, digits)}
      <style jsx>{`
        .anum-pct {
          font-family: var(--ins-font);
          font-weight: 700;
          font-size: 15px;
          line-height: 1.1;
          letter-spacing: -0.01em;
          font-variant-numeric: tabular-nums;
          display: inline-block;
        }
        @media (max-width: 640px) {
          .anum-pct {
            font-size: 12px;
          }
        }
      `}</style>
    </span>
  );
}
