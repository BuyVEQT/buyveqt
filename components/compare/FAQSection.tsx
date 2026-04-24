"use client";

import { useState } from "react";
import { COMPARE_FAQ } from "@/data/faq";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="border-t-2 border-[var(--ink)] pt-5"
      aria-labelledby="faq-heading"
    >
      <header className="mb-4">
        <p id="faq-heading" className="bs-stamp mb-1">
          Reader Mail
        </p>
        <h2
          className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-tight"
          style={{ color: "var(--ink)" }}
        >
          <em className="bs-display-italic">Common questions,</em> straight
          answers
        </h2>
      </header>

      <ul className="space-y-0" role="list">
        {COMPARE_FAQ.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <li
              key={i}
              className="border-t border-[var(--color-border)] last:border-b last:border-[var(--color-border)]"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-start justify-between gap-3 py-4 text-left group cursor-pointer"
                aria-expanded={isOpen}
              >
                <span
                  className="bs-display-italic text-[16px] sm:text-[17px] leading-snug pr-2"
                  style={{
                    color: isOpen ? "var(--stamp)" : "var(--ink)",
                  }}
                >
                  &ldquo;{item.question}&rdquo;
                </span>
                <span
                  aria-hidden
                  className="bs-display bs-numerals text-[1.25rem] leading-none shrink-0 transition-transform"
                  style={{
                    color: "var(--ink-soft)",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className="bs-body pb-5 pr-8 text-[14px] leading-[1.6] max-w-[68ch]"
                    style={{ color: "var(--ink)" }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
