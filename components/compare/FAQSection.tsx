"use client";

import { useState } from "react";
import { COMPARE_FAQ } from "@/data/faq";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * Compare FAQ — Round 4 D2 version. Accordion list with the first item
 * open by default. Vermilion-tinted question on open, ink question
 * closed. Plus caret rotates 45° to an X on open.
 */
export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Card>
      <SectionLabel>The questions</SectionLabel>
      <div
        className="ed-display-italic"
        style={{
          fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)",
          lineHeight: 1.1,
          color: "var(--ink)",
          marginTop: 6,
          marginBottom: 18,
        }}
      >
        Frequently asked.
      </div>

      <ul
        role="list"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {COMPARE_FAQ.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <li
              key={i}
              style={{
                borderTop: "1px solid var(--rule-soft)",
                borderBottom:
                  i === COMPARE_FAQ.length - 1
                    ? "1px solid var(--rule-soft)"
                    : "none",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "18px 0",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "inherit",
                  fontFamily: "inherit",
                }}
              >
                <span
                  className="ed-display"
                  style={{
                    fontSize: "clamp(1rem, 1.6vw, 1.125rem)",
                    lineHeight: 1.3,
                    color: isOpen ? "var(--stamp)" : "var(--ink)",
                    letterSpacing: "-0.01em",
                    paddingRight: 8,
                  }}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className="ed-display ed-numerals"
                  style={{
                    fontSize: 22,
                    lineHeight: 1,
                    color: "var(--ink-mute)",
                    flexShrink: 0,
                    transition: "transform 0.2s",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  opacity: isOpen ? 1 : 0,
                  transition:
                    "grid-template-rows 0.25s ease, opacity 0.25s ease",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <p
                    className="ed-body"
                    style={{
                      paddingBottom: 20,
                      paddingRight: 32,
                      fontSize: 14.5,
                      lineHeight: 1.6,
                      color: "var(--ink-soft)",
                      maxWidth: "68ch",
                      margin: 0,
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
