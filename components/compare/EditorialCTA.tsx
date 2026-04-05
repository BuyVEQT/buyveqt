"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function EditorialCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <>
      {/* ── Desktop: floating card, bottom-right ── */}
      <div className="hidden sm:block fixed bottom-4 right-4 z-30 max-w-xs animate-slide-up">
        <div className="relative rounded-xl border border-[var(--color-brand)]/40 bg-[var(--color-card)] shadow-lg ring-1 ring-black/5 p-4">
          {/* Accent bar */}
          <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b bg-gradient-to-r from-[var(--color-brand)] to-[#8b5cf6]" />

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)] transition-colors"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-1">
            Our Take
          </p>
          <p className="text-sm font-bold text-[var(--color-text-primary)] leading-snug mb-3 pr-5">
            The spreadsheet says they&apos;re the same.
          </p>
          <Link
            href="/learn/why-we-choose-veqt-over-xeqt"
            className="inline-flex items-center w-full justify-center px-4 py-2 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-colors"
          >
            Read why we choose VEQT&nbsp;&rarr;
          </Link>
        </div>
      </div>

      {/* ── Mobile: slim bottom bar ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 animate-slide-up">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--color-card)] border-t border-[var(--color-brand)]/30 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
          <Link
            href="/learn/why-we-choose-veqt-over-xeqt"
            className="flex-1 flex items-center gap-2 min-w-0"
          >
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-white bg-[var(--color-brand)] px-1.5 py-0.5 rounded">
              Our Take
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
              Why we choose VEQT &rarr;
            </span>
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1.5 -mr-1 rounded-md text-[var(--color-text-muted)]"
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
