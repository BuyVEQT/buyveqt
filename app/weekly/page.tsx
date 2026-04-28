import type { Metadata } from "next";
import Link from "next/link";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getAllWeeklyRecaps } from "@/lib/weekly";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "The Wire — VEQT Week-by-Week Recaps",
  description:
    "Short, useful weekly recaps of VEQT performance, the macro that moved it, and what matters for Canadian passive investors. Filed every Sunday.",
  alternates: { canonical: canonicalUrl("/weekly") },
  openGraph: {
    title: "The Wire — VEQT Week-by-Week Recaps",
    description:
      "Sunday-night recaps for Canadian VEQT investors — what moved, what didn't, and what it meant.",
    url: canonicalUrl("/weekly"),
  },
};

function formatRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
  const end = new Date(weekEnd).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${start} – ${end}`;
}

export default function WeeklyIndexPage() {
  const recaps = getAllWeeklyRecaps();

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Weekly", path: "/weekly" },
        ])}
      />

      {/* ── Page head ──────────────────────────────────────────── */}
      <section className="pt-8 sm:pt-10 pb-2 bs-enter">
        <p className="bs-stamp mb-3">The Wire</p>
        <h1
          className="bs-display text-[2.25rem] sm:text-[3.25rem] lg:text-[4.25rem] leading-[0.98]"
          style={{ color: "var(--ink)" }}
        >
          VEQT,
          <br />
          <em className="bs-display-italic">week by week.</em>
        </h1>
        <p
          className="bs-body italic mt-5 max-w-[58ch] text-[1.0625rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          Filed Sunday evenings. What moved this week, what drove it, and
          what — if anything — it changes for a 30-year hold. Brief by
          design.
        </p>
      </section>

      {/* ── Empty state vs. recap list ─────────────────────────── */}
      {recaps.length === 0 ? (
        <section className="mt-10 sm:mt-14 border-t-2 border-b-2 border-[var(--ink)] py-10 px-5 sm:px-8">
          <p className="bs-stamp mb-3">The First Edition</p>
          <h2
            className="bs-display text-[1.75rem] sm:text-[2.25rem] leading-[1.05] mb-4 max-w-[24ch]"
            style={{ color: "var(--ink)" }}
          >
            The press hasn&apos;t run yet.
          </h2>
          <p
            className="bs-body text-[15px] leading-[1.6] max-w-[58ch] mb-6"
            style={{ color: "var(--ink)" }}
          >
            We&apos;re building a weekly recap for VEQT investors — short,
            useful updates on what moved and why. Leave your email and
            we&apos;ll send the first edition the moment it ships.
          </p>
          <NewsletterSignup variant="section" />
        </section>
      ) : (
        <ol className="mt-8 sm:mt-10 border-t border-[var(--ink)]">
          {recaps.map((recap, idx) => {
            const isPos = recap.weeklyChange >= 0;
            const dispatchNumber = String(recaps.length - idx).padStart(2, "0");
            const range = formatRange(recap.weekStart, recap.weekEnd);
            return (
              <li
                key={recap.slug}
                className="border-b border-[var(--color-border)]"
              >
                <Link
                  href={`/weekly/${recap.slug}`}
                  className="group block py-6 sm:py-7 grid grid-cols-[auto_1fr_auto] gap-x-5 sm:gap-x-8 items-start"
                >
                  <span
                    className="bs-display bs-numerals text-2xl sm:text-3xl leading-none pt-1 tabular-nums"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {dispatchNumber}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="bs-label mb-1.5"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {range}
                    </p>
                    <h3
                      className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-[1.15] group-hover:text-[var(--stamp)] transition-colors"
                      style={{ color: "var(--ink)" }}
                    >
                      {recap.title}
                    </h3>
                    {recap.description && (
                      <p
                        className="bs-body text-[14px] mt-2 leading-[1.5] max-w-[58ch]"
                        style={{ color: "var(--ink)" }}
                      >
                        {recap.description}
                      </p>
                    )}
                  </div>
                  <span
                    className="bs-numerals tabular-nums text-[15px] sm:text-[16px] font-semibold pt-1 shrink-0"
                    style={{
                      color: isPos
                        ? "var(--color-positive)"
                        : "var(--color-negative)",
                    }}
                  >
                    {isPos ? "+" : ""}
                    {recap.weeklyChangePercent.toFixed(2)}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      {/* ── Newsletter footer (only when recaps exist) ─────────── */}
      {recaps.length > 0 && (
        <section className="mt-12 mb-4 max-w-[60ch]">
          <p className="bs-stamp mb-3">Subscribe</p>
          <h2
            className="bs-display text-[1.5rem] sm:text-[1.875rem] leading-[1.1] mb-3"
            style={{ color: "var(--ink)" }}
          >
            Get The Wire in your inbox.
          </h2>
          <p
            className="bs-body text-[14.5px] leading-[1.55] mb-5"
            style={{ color: "var(--ink)" }}
          >
            One short email Sunday evenings — what VEQT did, what drove it,
            and what (if anything) it changes for a 30-year hold.
          </p>
          <NewsletterSignup variant="section" />
        </section>
      )}
    </InteriorShell>
  );
}
