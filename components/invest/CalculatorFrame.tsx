import type { ReactNode } from "react";

interface CalculatorFrameProps {
  stamp: string;    // e.g. "The Lookback"
  title: string;    // e.g. "What it would have been"
  subhead: string;  // sentence
  children: ReactNode;
}

/**
 * Broadsheet-styled header above each calculator. Mirrors the section
 * patterns on /distributions (stamp eyebrow + display-italic title +
 * italic subhead) so a calculator reads as one of the publication's
 * "workings" rather than a free-floating tool.
 *
 * Internals (the calculator itself) render unchanged below.
 */
export default function CalculatorFrame({
  stamp,
  title,
  subhead,
  children,
}: CalculatorFrameProps) {
  return (
    <section className="mt-8 sm:mt-10 pt-6 border-t-2 border-[var(--ink)]">
      <p className="bs-stamp mb-3">{stamp}</p>
      <h2
        className="bs-display text-[1.5rem] sm:text-[2rem] mb-2"
        style={{ color: "var(--ink)" }}
      >
        {title}
      </h2>
      <p
        className="bs-caption italic mb-6 max-w-[60ch]"
        style={{ color: "var(--ink-soft)" }}
      >
        {subhead}
      </p>

      <div>{children}</div>
    </section>
  );
}
