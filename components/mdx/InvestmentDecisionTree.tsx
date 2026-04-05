"use client";

import { useState } from "react";

type StepId =
  | "start"
  | "debt"
  | "timeline"
  | "timeline_short"
  | "risk"
  | "account"
  | "account_fhb"
  | "result_emergency"
  | "result_debt"
  | "result_gic"
  | "result_balanced"
  | "result_veqt"
  | "result_vgro"
  | "result_veqt_fhb"
  | "result_vgro_fhb";

interface ResultData {
  title: string;
  action: string;
  product: string;
  links: { label: string; href: string }[];
  color: "brand" | "positive" | "warning";
}

const RESULTS: Record<string, ResultData> = {
  result_emergency: {
    title: "Build your emergency fund first",
    action:
      "Save 3-6 months of expenses in a high-interest savings account before investing. This protects you from having to sell investments during an emergency.",
    product: "HISA (not VEQT)",
    links: [
      { label: "VEQT vs GICs/HISA →", href: "/learn/veqt-vs-gics-hisa" },
    ],
    color: "warning",
  },
  result_debt: {
    title: "Pay off high-interest debt first",
    action:
      "Debt above ~5-6% interest costs you more than investing is likely to earn. Pay it off aggressively, then redirect those payments into investments. Mortgage and student loan debt at low rates can coexist with investing.",
    product: "Debt repayment",
    links: [
      { label: "Getting started with VEQT →", href: "/learn/getting-started-with-veqt" },
    ],
    color: "warning",
  },
  result_gic: {
    title: "Use a GIC or HISA",
    action:
      "Money needed within 1-3 years shouldn't be in equities. A GIC or high-interest savings account protects your capital. The tax deduction from an FHSA or RRSP may still be worth capturing — just hold safe assets inside.",
    product: "GIC or HISA",
    links: [
      { label: "VEQT vs GICs/HISA →", href: "/learn/veqt-vs-gics-hisa" },
      { label: "VEQT in your FHSA →", href: "/learn/veqt-in-your-fhsa" },
    ],
    color: "warning",
  },
  result_balanced: {
    title: "Consider a balanced ETF",
    action:
      "With a 3-5 year timeline, 100% equity is risky but pure GICs may sacrifice too much growth. A balanced ETF like VBAL (60/40) or VGRO (80/20) splits the difference.",
    product: "VBAL or VGRO",
    links: [
      { label: "VEQT vs VGRO →", href: "/learn/veqt-vs-vgro" },
      { label: "VEQT in your FHSA →", href: "/learn/veqt-in-your-fhsa" },
    ],
    color: "positive",
  },
  result_vgro: {
    title: "Buy VGRO",
    action:
      "You have the time horizon for equities but prefer a smoother ride. VGRO (80% stocks, 20% bonds) gives you most of the growth with less volatility. Nothing wrong with this — the best fund is the one you can hold through a crash.",
    product: "VGRO",
    links: [
      { label: "VEQT vs VGRO →", href: "/learn/veqt-vs-vgro" },
      { label: "Getting started →", href: "/learn/getting-started-with-veqt" },
      {
        label: "Account priority →",
        href: "/learn/veqt-tfsa-rrsp-taxable",
      },
    ],
    color: "positive",
  },
  result_veqt: {
    title: "Buy VEQT",
    action:
      "You have a long time horizon and the temperament for 100% equities. VEQT gives you maximum expected return in a single ticker — 13,700 stocks across 50+ countries, fully automated.",
    product: "VEQT",
    links: [
      { label: "Getting started →", href: "/learn/getting-started-with-veqt" },
      {
        label: "Account priority →",
        href: "/learn/veqt-tfsa-rrsp-taxable",
      },
      { label: "What is VEQT? →", href: "/learn/what-is-veqt" },
    ],
    color: "brand",
  },
  result_vgro_fhb: {
    title: "Buy VGRO — and open your FHSA",
    action:
      "You want some growth but prefer a cushion. VGRO in an FHSA gives you the double tax benefit while keeping volatility manageable. Plan a glide path to safer assets as your purchase date approaches.",
    product: "VGRO (in FHSA)",
    links: [
      { label: "VEQT in your FHSA →", href: "/learn/veqt-in-your-fhsa" },
      { label: "VEQT vs VGRO →", href: "/learn/veqt-vs-vgro" },
    ],
    color: "positive",
  },
  result_veqt_fhb: {
    title: "Buy VEQT — and open your FHSA",
    action:
      "With 5+ years before buying, VEQT in an FHSA is a strong play — you get the double tax benefit and full equity growth. Plan to de-risk into bonds or GICs 2-3 years before your purchase date.",
    product: "VEQT (in FHSA)",
    links: [
      { label: "VEQT in your FHSA →", href: "/learn/veqt-in-your-fhsa" },
      { label: "Getting started →", href: "/learn/getting-started-with-veqt" },
    ],
    color: "brand",
  },
};

interface Step {
  question: string;
  options: { label: string; next: StepId }[];
}

const STEPS: Record<string, Step> = {
  start: {
    question: "Do you have an emergency fund (3-6 months of expenses)?",
    options: [
      { label: "Yes", next: "debt" },
      { label: "No / Not enough", next: "result_emergency" },
    ],
  },
  debt: {
    question:
      "Do you have high-interest debt (credit cards, personal loans above ~5-6%)?",
    options: [
      { label: "Yes", next: "result_debt" },
      { label: "No", next: "timeline" },
    ],
  },
  timeline: {
    question: "When do you need this money?",
    options: [
      { label: "Within 3 years", next: "result_gic" },
      { label: "3-5 years", next: "timeline_short" },
      { label: "5+ years", next: "account" },
    ],
  },
  timeline_short: {
    question: "Is this money for a home purchase?",
    options: [
      { label: "Yes", next: "result_balanced" },
      { label: "No", next: "result_balanced" },
    ],
  },
  account: {
    question: "Are you planning to buy your first home?",
    options: [
      { label: "Yes", next: "account_fhb" },
      { label: "No / Already own", next: "risk" },
    ],
  },
  account_fhb: {
    question:
      "How would you feel if your portfolio dropped 35% in a year?",
    options: [
      {
        label: "I'd stay the course",
        next: "result_veqt_fhb",
      },
      {
        label: "I'd be very uncomfortable",
        next: "result_vgro_fhb",
      },
    ],
  },
  risk: {
    question:
      "How would you feel if your portfolio dropped 35% in a year?",
    options: [
      {
        label: "I'd stay the course — maybe even buy more",
        next: "result_veqt",
      },
      {
        label: "I'd be uncomfortable but wouldn't sell",
        next: "result_vgro",
      },
      {
        label: "I'd seriously consider selling",
        next: "result_vgro",
      },
    ],
  },
};

type Answer = { stepId: string; answer: string; label: string };

export function InvestmentDecisionTree() {
  const [currentStep, setCurrentStep] = useState<StepId>("start");
  const [history, setHistory] = useState<Answer[]>([]);

  const isResult = currentStep.startsWith("result_");
  const result = isResult ? RESULTS[currentStep] : null;
  const step = !isResult ? STEPS[currentStep] : null;

  const choose = (optionLabel: string, next: StepId) => {
    if (!step) return;
    setHistory((h) => [
      ...h,
      { stepId: currentStep, answer: optionLabel, label: step.question },
    ]);
    setCurrentStep(next);
  };

  const reset = () => {
    setCurrentStep("start");
    setHistory([]);
  };

  const resultColorMap = {
    brand: {
      border: "border-[var(--color-brand)]",
      bg: "bg-[var(--color-brand)]/[0.04]",
      badge: "bg-[var(--color-brand)] text-white",
      text: "text-[var(--color-brand)]",
    },
    positive: {
      border: "border-[var(--color-positive)]",
      bg: "bg-[var(--color-positive-bg)]",
      badge: "bg-[var(--color-positive)] text-white",
      text: "text-[var(--color-positive)]",
    },
    warning: {
      border: "border-[#d97706]",
      bg: "bg-[rgba(217,119,6,0.04)]",
      badge: "bg-[#d97706] text-white",
      text: "text-[#d97706]",
    },
  };

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-card-hover)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Investment Decision Tool
        </p>
      </div>

      <div className="p-5">
        {/* History */}
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
                <span className="flex-1 line-through opacity-60">
                  {h.label}
                </span>
                <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  {h.answer}
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
            <div className="flex flex-col sm:flex-row gap-2">
              {step.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => choose(opt.label, opt.next)}
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-hover)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors text-center"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div>
            <div
              className={`rounded-lg border ${resultColorMap[result.color].border} ${resultColorMap[result.color].bg} p-4 mb-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${resultColorMap[result.color].badge}`}
                >
                  {result.product}
                </span>
              </div>
              <p
                className={`text-base font-bold mb-2 ${resultColorMap[result.color].text}`}
              >
                {result.title}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {result.action}
              </p>
            </div>

            {/* Article links */}
            <div className="space-y-1.5 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Read more
              </p>
              {result.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <button
              onClick={reset}
              className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              ← Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
