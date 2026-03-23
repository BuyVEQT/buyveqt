"use client";

import { useState } from "react";
import { COMPARE_FAQ } from "@/data/faq";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white">
      <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] px-5 pt-5 pb-3">
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-[var(--color-border)]">
        {COMPARE_FAQ.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left group"
              >
                <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">
                  {item.question}
                </span>
                <svg
                  className={`w-4 h-4 text-[var(--color-text-muted)] shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-[var(--color-text-muted)] leading-relaxed max-w-prose">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
