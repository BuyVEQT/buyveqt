"use client";

import { useState } from "react";

type StepId =
  | "start"
  | "income_fhb"
  | "income_no_fhb"
  | "employer_match"
  | "result_a"
  | "result_b"
  | "result_c"
  | "result_d";

interface Result {
  priority: string[];
  note: string;
}

const RESULTS: Record<string, Result> = {
  result_a: {
    priority: ["FHSA", "TFSA", "RRSP", "Taxable"],
    note: "FHSA first for the double tax benefit, then TFSA for flexibility, then RRSP — its deduction is most valuable at higher incomes.",
  },
  result_b: {
    priority: ["FHSA", "TFSA", "Taxable"],
    note: "FHSA first for the double tax benefit, then TFSA. At lower income brackets the RRSP deduction is less valuable — prioritize it after TFSA if you have room.",
  },
  result_c: {
    priority: ["RRSP (match)", "TFSA", "RRSP (remainder)", "Taxable"],
    note: "Always capture the full employer match first — it's a 100% instant return. Then maximize your TFSA, then contribute any remaining RRSP room.",
  },
  result_d: {
    priority: ["TFSA", "RRSP", "Taxable"],
    note: "TFSA first for most people. RRSP is worth prioritizing if your income is high and you expect to be in a lower bracket in retirement.",
  },
};

interface Step {
  question: string;
  yes: StepId;
  no: StepId;
}

const STEPS: Record<string, Step> = {
  start: {
    question: "Are you a first-time home buyer (or planning to buy in the next 15 years)?",
    yes: "income_fhb",
    no: "income_no_fhb",
  },
  income_fhb: {
    question: "Is your household income above $55,000?",
    yes: "result_a",
    no: "result_b",
  },
  income_no_fhb: {
    question: "Is your household income above $55,000?",
    yes: "employer_match",
    no: "result_d",
  },
  employer_match: {
    question: "Does your employer offer RRSP matching?",
    yes: "result_c",
    no: "result_d",
  },
};

type Answer = { stepId: string; answer: "yes" | "no"; label: string };

export function AccountFlowchart() {
  const [currentStep, setCurrentStep] = useState<StepId>("start");
  const [history, setHistory] = useState<Answer[]>([]);

  const isResult = currentStep.startsWith("result_");
  const result = isResult ? RESULTS[currentStep] : null;
  const step = !isResult ? STEPS[currentStep] : null;

  const answer = (choice: "yes" | "no") => {
    if (!step) return;
    const next = choice === "yes" ? step.yes : step.no;
    setHistory((h) => [
      ...h,
      { stepId: currentStep, answer: choice, label: step.question },
    ]);
    setCurrentStep(next as StepId);
  };

  const reset = () => {
    setCurrentStep("start");
    setHistory([]);
  };

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-card-hover)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Account Priority Tool
        </p>
      </div>

      <div className="p-5">
        {/* History — previous answered questions */}
        {history.length > 0 && (
          <div className="mb-4 space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]"
              >
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[10px] font-semibold">
                  {i + 1}
                </span>
                <span className="flex-1 line-through opacity-60">{h.label}</span>
                <span
                  className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    h.answer === "yes"
                      ? "bg-[var(--color-positive-bg)] text-[var(--color-positive)]"
                      : "bg-[var(--color-negative-bg)] text-[var(--color-negative)]"
                  }`}
                >
                  {h.answer === "yes" ? "Yes" : "No"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Active question */}
        {step && (
          <div>
            <div className="flex items-start gap-3 mb-5">
              <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center text-[10px] font-semibold">
                {history.length + 1}
              </span>
              <p className="text-[var(--color-text-primary)] font-medium leading-snug">
                {step.question}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => answer("yes")}
                className="flex-1 rounded-lg border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Yes
              </button>
              <button
                onClick={() => answer("no")}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-hover)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-3">
              Recommended Priority
            </p>
            <ol className="space-y-2 mb-4">
              {result.priority.map((acct, i) => (
                <li key={acct} className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      i === 0
                        ? "bg-[var(--color-brand)] text-white"
                        : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      i === 0
                        ? "text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {acct}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-4">
              {result.note}
            </p>
            <button
              onClick={reset}
              className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
            >
              ← Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
