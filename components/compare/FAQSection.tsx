"use client";

import { useState } from "react";
import { COMPARE_FAQ } from "@/data/faq";

const css = `
.ins-cmp-faq {
  border-top: 3px solid var(--ins-rule-strong, #111111);
  padding-top: 16px;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmp-faq__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
}
.ins-cmp-faq__eyebrow {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.ins-cmp-faq__display {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.ins-cmp-faq__note {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  white-space: nowrap;
}
.ins-cmp-faq__list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  border-top: 1px solid var(--ins-ink);
}
.ins-cmp-faq__item {
  border-bottom: 1px solid var(--ins-hair);
}
.ins-cmp-faq__q {
  appearance: none;
  background: transparent;
  border: none;
  border-radius: 0;
  width: 100%;
  cursor: pointer;
  color: var(--ins-ink);
  font-family: inherit;
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 18px;
  align-items: start;
  text-align: left;
  padding: 16px 0;
  min-height: 44px;
}
.ins-cmp-faq__ordinal {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.ins-cmp-faq__q-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
  padding-right: 8px;
}
.ins-cmp-faq__toggle {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.1;
  color: var(--ins-gray-600);
  transition: transform 0.2s ease, color 0.18s ease;
}
.ins-cmp-faq__q:hover .ins-cmp-faq__toggle {
  color: var(--ins-ink);
}
.ins-cmp-faq__q[aria-expanded="true"] .ins-cmp-faq__toggle {
  transform: rotate(45deg);
  color: var(--ins-ink);
}
.ins-cmp-faq__panel {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 0.25s ease, opacity 0.25s ease;
}
.ins-cmp-faq__panel--open {
  grid-template-rows: 1fr;
  opacity: 1;
}
.ins-cmp-faq__panel-inner {
  overflow: hidden;
}
.ins-cmp-faq__a {
  margin: 0;
  padding: 0 52px 20px 70px;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-gray-700);
  max-width: 78ch;
  text-wrap: pretty;
}

@media (prefers-reduced-motion: reduce) {
  .ins-cmp-faq__panel,
  .ins-cmp-faq__toggle { transition: none; }
}

@media (max-width: 900px) {
  .ins-cmp-faq__note { display: none; }
}

@media (max-width: 640px) {
  .ins-cmp-faq { padding-top: 12px; }
  .ins-cmp-faq__eyebrow { font-size: 9px; letter-spacing: 0.18em; }
  .ins-cmp-faq__display { margin-top: 6px; font-size: 20px; }
  .ins-cmp-faq__list { margin-top: 8px; }
  .ins-cmp-faq__q {
    grid-template-columns: 30px 1fr auto;
    gap: 12px;
    padding: 14px 0;
  }
  .ins-cmp-faq__ordinal { font-size: 15px; }
  .ins-cmp-faq__q-text { font-size: 15px; line-height: 1.35; }
  .ins-cmp-faq__toggle { font-size: 17px; }
  .ins-cmp-faq__a {
    padding: 0 0 16px 42px;
    font-size: 13.5px;
  }
}
`;

/**
 * Compare FAQ in the Instrument article grammar — 3px rule, eyebrow +
 * display, then ordinal-numbered ruled Q/A rows.
 *
 * Every question and answer is `data/faq.ts` COMPARE_FAQ verbatim; the
 * same array feeds the FAQPage structured data on `app/compare/page.tsx`,
 * so the two never drift. Still an accordion — thirteen answers open at
 * once is a wall, not a page — with the first row open.
 */
export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="ins-cmp-faq" aria-labelledby="ins-cmp-faq-display">
      <header className="ins-cmp-faq__head">
        <div>
          <div className="ins-cmp-faq__eyebrow">
            The questions · {COMPARE_FAQ.length} on file
          </div>
          <h2 id="ins-cmp-faq-display" className="ins-cmp-faq__display">
            Frequently asked.
          </h2>
        </div>
        <span className="ins-cmp-faq__note">Not investment advice</span>
      </header>

      <ul className="ins-cmp-faq__list">
        {COMPARE_FAQ.map((item, i) => {
          const isOpen = openIndex === i;
          const panelId = `ins-cmp-faq-panel-${i}`;
          return (
            <li key={i} className="ins-cmp-faq__item">
              <button
                type="button"
                className="ins-cmp-faq__q"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span className="ins-cmp-faq__ordinal" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ins-cmp-faq__q-text">{item.question}</span>
                <span className="ins-cmp-faq__toggle" aria-hidden>
                  +
                </span>
              </button>
              <div
                id={panelId}
                className={`ins-cmp-faq__panel${
                  isOpen ? " ins-cmp-faq__panel--open" : ""
                }`}
              >
                <div className="ins-cmp-faq__panel-inner">
                  <p className="ins-cmp-faq__a">{item.answer}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
