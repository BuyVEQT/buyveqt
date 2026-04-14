"use client";

import { useState, useEffect, useRef } from "react";

interface Step {
  year: number;
  event: string;
  invested: number;
  runningTotal: number;
  crash: number;
  description: string;
  afterCrashFeeling: string;
}

const STEPS: Step[] = [
  {
    year: 1973,
    event: "Oil Crisis Peak",
    invested: 6000,
    runningTotal: 6000,
    crash: -48,
    description:
      "Bob invests his first $6,000 right before the oil embargo tanks the market. Nearly half his money evaporates.",
    afterCrashFeeling: "Bob doesn\u2019t sell.",
  },
  {
    year: 1987,
    event: "Black Monday Peak",
    invested: 46000,
    runningTotal: 52000,
    crash: -34,
    description:
      "Bob\u2019s been saving for 14 years. He invests $46,000 the day before the largest single-day crash in history \u2014 a 22% drop in one day.",
    afterCrashFeeling: "Bob doesn\u2019t sell.",
  },
  {
    year: 2000,
    event: "Dot-Com Peak",
    invested: 68000,
    runningTotal: 120000,
    crash: -49,
    description:
      "Bob invests $68,000 at the peak of the tech bubble. The market drops 49% over the next two years. His coworkers think he\u2019s crazy.",
    afterCrashFeeling: "Bob doesn\u2019t sell.",
  },
  {
    year: 2007,
    event: "Financial Crisis Peak",
    invested: 64000,
    runningTotal: 184000,
    crash: -57,
    description:
      "Bob invests $64,000 right before the worst financial crisis since the Great Depression. Banks collapse. Stocks lose 57%.",
    afterCrashFeeling: "Bob doesn\u2019t sell.",
  },
];

function formatDollars(value: number): string {
  return "$" + value.toLocaleString("en-CA");
}

function AnimatedNumber({
  value,
  duration = 600,
  className,
  style,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    prevValue.current = value;

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span className={className} style={style}>
      {prefix}
      {display.toLocaleString("en-CA")}
      {suffix}
    </span>
  );
}

export function BobTimeline() {
  const [step, setStep] = useState(-1); // -1 = intro, 0-3 = purchases, 4 = reveal
  const [showCrash, setShowCrash] = useState(false);
  const [showHold, setShowHold] = useState(false);

  const isIntro = step === -1;
  const isReveal = step === 4;
  const currentStep = step >= 0 && step <= 3 ? STEPS[step] : null;

  // Reset crash/hold animations when step changes
  useEffect(() => {
    setShowCrash(false);
    setShowHold(false);

    if (step >= 0 && step <= 3) {
      const crashTimer = setTimeout(() => setShowCrash(true), 400);
      const holdTimer = setTimeout(() => setShowHold(true), 1200);
      return () => {
        clearTimeout(crashTimer);
        clearTimeout(holdTimer);
      };
    }
  }, [step]);

  function next() {
    if (step < 4) setStep(step + 1);
  }

  function prev() {
    if (step > -1) setStep(step - 1);
  }

  function restart() {
    setStep(-1);
  }

  // Running total up to current step
  const totalInvested =
    step >= 0 && step <= 3
      ? STEPS[step].runningTotal
      : step === 4
        ? 184000
        : 0;

  // Progress dots
  const totalSteps = 6; // intro + 4 purchases + reveal

  return (
    <div
      className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6"
      style={{ color: "var(--color-text-secondary)" }}
    >
      {/* Header */}
      <h3
        className="text-base font-semibold mb-1"
        style={{ color: "var(--color-text-primary)" }}
      >
        Bob, the World&apos;s Worst Market Timer
      </h3>
      <p
        className="text-sm mb-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        Step through Bob&apos;s four purchases — each one at the absolute worst
        possible moment.
      </p>

      {/* Progress bar */}
      <div className="flex items-center gap-1.5 mb-5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i <= step + 1
                  ? isReveal
                    ? "var(--color-positive)"
                    : "var(--color-brand)"
                  : "var(--color-border)",
            }}
          />
        ))}
      </div>

      {/* Content area — fixed height to prevent layout shift */}
      <div className="min-h-[280px] sm:min-h-[240px] flex flex-col">
        {/* INTRO */}
        {isIntro && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6">
            <div className="text-4xl mb-4">📉</div>
            <p
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Meet Bob.
            </p>
            <p
              className="text-sm leading-relaxed max-w-md"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Bob is the unluckiest investor in history. He only invested his
              money at the absolute worst times — right before every major
              market crash. Let&apos;s see how he did.
            </p>
          </div>
        )}

        {/* PURCHASE STEPS */}
        {currentStep && (
          <div className="flex-1 flex flex-col">
            {/* Year + Event header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full border shrink-0"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--color-negative)" }}
                >
                  {currentStep.year}
                </span>
              </div>
              <div>
                <p
                  className="text-base font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {currentStep.event}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Purchase {step + 1} of 4
                </p>
              </div>
            </div>

            {/* Investment amount */}
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] p-4 mb-3">
              <p
                className="text-xs mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Bob invests
              </p>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: "var(--color-text-primary)" }}
              >
                {formatDollars(currentStep.invested)}
              </p>
            </div>

            {/* Crash reveal */}
            <div
              className="rounded-md border p-4 mb-3 transition-all duration-500"
              style={{
                borderColor: showCrash
                  ? "var(--color-negative)"
                  : "var(--color-border)",
                backgroundColor: showCrash
                  ? "rgba(239, 68, 68, 0.05)"
                  : "var(--color-base)",
                opacity: showCrash ? 1 : 0.3,
                transform: showCrash ? "scale(1)" : "scale(0.98)",
              }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Then the market crashes
              </p>
              <div className="flex items-baseline gap-2">
                {showCrash ? (
                  <AnimatedNumber
                    value={currentStep.crash}
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: "var(--color-negative)" }}
                    suffix="%"
                    duration={800}
                  />
                ) : (
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    ...
                  </span>
                )}
              </div>
              {showCrash && (
                <p
                  className="text-xs leading-relaxed mt-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {currentStep.description}
                </p>
              )}
            </div>

            {/* "Bob doesn't sell" */}
            <div
              className="rounded-md border p-3 transition-all duration-500"
              style={{
                borderColor: "rgba(26, 122, 76, 0.3)",
                backgroundColor: "var(--color-positive-bg)",
                opacity: showHold ? 1 : 0,
                transform: showHold ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <p
                className="text-sm font-semibold text-center"
                style={{ color: "var(--color-positive)" }}
              >
                {currentStep.afterCrashFeeling}
              </p>
            </div>
          </div>
        )}

        {/* REVEAL */}
        {isReveal && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              Total invested over 34 years
            </p>
            <p
              className="text-xl font-bold tabular-nums mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              {formatDollars(184000)}
            </p>

            <div
              className="text-2xl mb-4"
              style={{ color: "var(--color-positive)" }}
            >
              &darr;
            </div>

            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              Final portfolio value (2013)
            </p>
            <AnimatedNumber
              value={1160000}
              className="text-4xl sm:text-5xl font-bold tabular-nums"
              style={{ color: "var(--color-positive)" }}
              prefix="$"
              duration={1500}
            />

            <div
              className="mt-5 rounded-md border p-3 max-w-sm"
              style={{
                borderColor: "rgba(26, 122, 76, 0.2)",
                backgroundColor: "var(--color-positive-bg)",
              }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <strong style={{ color: "var(--color-positive)" }}>
                  Bob&apos;s only rule:
                </strong>{" "}
                never sell. Despite the worst timing imaginable, holding through
                every crash produced an annualized return of roughly 9%.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Running total bar (visible during purchase steps) */}
      {step >= 0 && step <= 3 && (
        <div className="flex items-center justify-between rounded-md bg-[var(--color-base)] border border-[var(--color-border)] px-4 py-2 mt-3">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Running total invested
          </span>
          <AnimatedNumber
            value={totalInvested}
            className="text-sm font-bold tabular-nums"
            style={{ color: "var(--color-text-primary)" }}
            prefix="$"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={isReveal ? restart : prev}
          disabled={isIntro}
          className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--color-border)] hover:bg-[var(--color-base)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {isReveal ? "Start over" : "Back"}
        </button>

        <span
          className="text-[11px] tabular-nums"
          style={{ color: "var(--color-text-muted)" }}
        >
          {step + 2} / {totalSteps}
        </span>

        {!isReveal && (
          <button
            onClick={next}
            className="px-4 py-2 text-sm font-semibold rounded-md text-white transition-colors"
            style={{
              backgroundColor:
                step === 3 ? "var(--color-positive)" : "var(--color-brand)",
            }}
          >
            {isIntro
              ? "Begin"
              : step === 3
                ? "See the result"
                : "Next purchase"}
          </button>
        )}

        {isReveal && <div className="w-[88px]" />}
      </div>

      <p
        className="mt-4 text-[11px]"
        style={{ color: "var(--color-text-muted)" }}
      >
        Based on Ben Carlson&apos;s analysis at A Wealth of Common Sense.
        S&amp;P 500 total return data. Amounts and timing are approximate.
      </p>
    </div>
  );
}
