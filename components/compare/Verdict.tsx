"use client";

import Link from "next/link";
import { getVerdict } from "@/lib/compare-verdicts";

interface VerdictProps {
  selectedFunds: string[];
}

/**
 * "Our take" — a curated, opinionated paragraph that appears only when
 * exactly two funds are selected AND that pair appears in the verdicts
 * library. We don't fake an opinion for arbitrary pairs.
 *
 * Visually: full-bleed vermilion stamp eyebrow ("Our Take"), display-italic
 * headline, body in the broadsheet body face, optional CTA link below.
 * Sits in its own band, separated by the section's signature thick rule.
 */
export default function Verdict({ selectedFunds }: VerdictProps) {
  if (selectedFunds.length !== 2) return null;
  const verdict = getVerdict(selectedFunds[0], selectedFunds[1]);
  if (!verdict) return null;

  return (
    <section
      className="border-t-2 border-[var(--ink)] pt-6 pb-2"
      aria-labelledby="verdict-heading"
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-8 gap-y-4">
        <div className="sm:col-span-5">
          <p
            id="verdict-heading"
            className="bs-stamp mb-3 inline-block"
            style={{
              color: "var(--paper)",
              backgroundColor: "var(--stamp)",
              padding: "5px 10px 4px",
              letterSpacing: "0.18em",
            }}
          >
            Our Take
          </p>
          <h3
            className="bs-display-italic text-[1.5rem] sm:text-[1.875rem] leading-[1.1]"
            style={{ color: "var(--ink)" }}
          >
            &ldquo;{verdict.headline}&rdquo;
          </h3>
        </div>

        <div className="sm:col-span-7 flex flex-col">
          <p
            className="bs-body text-[15px] leading-[1.55]"
            style={{ color: "var(--ink)" }}
          >
            {verdict.body}
          </p>

          {verdict.cta && (
            <p className="bs-caption mt-4">
              <Link href={verdict.cta.href} className="bs-link italic">
                {verdict.cta.label} &rarr;
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
