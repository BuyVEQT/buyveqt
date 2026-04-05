"use client";

import { useState, useEffect } from "react";

interface ProgressTrackerProps {
  labels: string;
  anchors: string;
}

export function ProgressTracker({ labels, anchors }: ProgressTrackerProps) {
  const steps = labels.split("|").map((s) => s.trim());
  const ids = anchors.split("|").map((s) => s.trim());
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          const idx = ids.lastIndexOf(id);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
        Getting started — 5 steps
      </p>

      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start gap-0">
        {steps.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          const isFirst = i === 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {/* Connector line before */}
              {!isFirst && (
                <div
                  className={`absolute top-3 right-1/2 w-full h-[2px] ${
                    isDone || isActive ? "bg-[var(--color-brand)]" : "bg-[var(--color-border)]"
                  }`}
                  style={{ right: "50%", width: "100%" }}
                />
              )}

              {/* Circle */}
              <button
                onClick={() => scrollTo(ids[i])}
                className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                  isActive
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                    : isDone
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)]"
                }`}
                aria-label={`Go to step ${i + 1}: ${step}`}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </button>

              {/* Label */}
              <p
                className={`mt-2 text-center text-[11px] leading-tight px-1 ${
                  isActive
                    ? "font-semibold text-[var(--color-text-primary)]"
                    : isDone
                      ? "text-[var(--color-text-secondary)]"
                      : "text-[var(--color-text-muted)]"
                }`}
              >
                {step}
              </p>

            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-0 sm:hidden">
        {steps.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          const isLast = i === steps.length - 1;

          return (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => scrollTo(ids[i])}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isActive
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                      : isDone
                        ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)]"
                  }`}
                  aria-label={`Go to step ${i + 1}: ${step}`}
                >
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>
                {!isLast && (
                  <div
                    className={`w-[2px] h-6 mt-1 ${
                      isDone ? "bg-[var(--color-brand)]" : "bg-[var(--color-border)]"
                    }`}
                  />
                )}
              </div>
              <p
                className={`pt-1 text-sm leading-tight ${
                  isActive
                    ? "font-semibold text-[var(--color-text-primary)]"
                    : isDone
                      ? "text-[var(--color-text-secondary)]"
                      : "text-[var(--color-text-muted)]"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
