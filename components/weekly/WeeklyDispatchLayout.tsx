import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { WeeklyRecap } from "@/lib/weekly";
import NewsletterSignup from "@/components/NewsletterSignup";
import ReadingProgress from "@/components/broadsheet/dispatch/ReadingProgress";
import { Pullquote } from "@/components/mdx/Pullquote";
import { Callout } from "@/components/mdx/Callout";
import { Summary } from "@/components/mdx/Summary";

const mdxComponents = {
  Pullquote,
  Callout,
  Summary,
};

function formatLongRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart).toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
  });
  const end = new Date(weekEnd).toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${start} – ${end}`;
}

function formatFiledOn(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface WeeklyDispatchLayoutProps {
  recap: WeeklyRecap;
  ordinal: number | null;
  previous: WeeklyRecap | null;
  next: WeeklyRecap | null;
}

/**
 * Weekly dispatch layout — broadsheet article chrome adapted for the
 * weekly recaps. Mirrors components/learn/ArticleLayout so /weekly and
 * /learn read as columns from one publication.
 *
 * Top of the page:
 *   - Reading-progress bar (same vermilion stamp line)
 *   - Breadcrumb "Wire · range"
 *   - Stamp "Dispatch No. NN", filed date
 *   - Display-italic title, max 22ch
 *   - Caption strip: open → close, weekly delta, dollar move
 *
 * Body: standard prose-custom column, 65ch max.
 *
 * Bottom: "Continue to next dispatch" CTA (newer recap, since "next"
 * for a reader catching up means going forward in time), with the
 * older recap as a subtler "Previously" line. Newsletter signup last.
 */
export default function WeeklyDispatchLayout({
  recap,
  ordinal,
  previous,
  next,
}: WeeklyDispatchLayoutProps) {
  const isPos = recap.weeklyChange >= 0;
  const range = formatLongRange(recap.weekStart, recap.weekEnd);
  const filed = formatFiledOn(recap.date);
  const dispatchLabel = ordinal
    ? `Dispatch No. ${String(ordinal).padStart(2, "0")}`
    : "The Wire";

  return (
    <>
      <ReadingProgress />

      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <nav
        className="pt-5 pb-2 bs-caption flex items-center gap-2 flex-wrap"
        style={{ color: "var(--ink-soft)" }}
      >
        <Link href="/weekly" className="bs-link" style={{ color: "var(--ink)" }}>
          The Wire
        </Link>
        <span className="opacity-40">·</span>
        <span className="italic">{range}</span>
      </nav>

      {/* ── Article head ─────────────────────────────────────────── */}
      <header className="pt-4 pb-8 sm:pb-10 border-b border-[var(--ink)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <p className="bs-stamp">{dispatchLabel}</p>
          <p
            className="bs-label tabular-nums shrink-0"
            style={{ color: "var(--ink-soft)" }}
          >
            Filed {filed}
          </p>
        </div>
        <h1
          className="bs-display-italic text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] leading-[1.02] max-w-[22ch]"
          style={{ color: "var(--ink)" }}
        >
          {recap.title}
        </h1>

        {/* Price strip — open → close + weekly delta */}
        <div
          className="mt-6 flex items-baseline gap-x-5 gap-y-2 flex-wrap bs-numerals tabular-nums"
          style={{ color: "var(--ink)" }}
        >
          <span
            className="text-[1.875rem] sm:text-[2.25rem] font-semibold leading-none"
            style={{
              color: isPos
                ? "var(--color-positive)"
                : "var(--color-negative)",
            }}
          >
            {isPos ? "+" : ""}
            {recap.weeklyChangePercent.toFixed(2)}%
          </span>
          <span
            className="text-[15px] italic"
            style={{ color: "var(--ink-soft)", fontFamily: "var(--font-serif)" }}
          >
            ${recap.veqtOpen.toFixed(2)} → ${recap.veqtClose.toFixed(2)}
          </span>
          <span
            className="text-[14px]"
            style={{
              color: isPos
                ? "var(--color-positive)"
                : "var(--color-negative)",
            }}
          >
            ({isPos ? "+" : ""}${recap.weeklyChange.toFixed(2)})
          </span>
        </div>

        {recap.description && (
          <p
            className="bs-body italic mt-5 text-[1rem] sm:text-[1.0625rem] leading-[1.55] max-w-[60ch]"
            style={{ color: "var(--ink-soft)" }}
          >
            {recap.description}
          </p>
        )}
      </header>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <article className="prose-custom pt-8 lg:pt-10 max-w-[65ch]">
        <MDXRemote
          source={recap.content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      {/* ── Next / Previous dispatch ────────────────────────────── */}
      {(next || previous) && (
        <div className="max-w-[65ch] mt-10 border-t-2 border-[var(--ink)] pt-6">
          {next && (
            <Link
              href={`/weekly/${next.slug}`}
              className="group block"
              style={{ color: "var(--ink)" }}
            >
              <p className="bs-stamp mb-3">Continue to the next dispatch</p>
              <h3 className="bs-display-italic text-[1.5rem] sm:text-[2rem] leading-[1.05] group-hover:text-[var(--stamp)] transition-colors">
                {next.title}
              </h3>
              <p
                className="bs-caption mt-3 flex items-center flex-wrap gap-x-3 gap-y-1"
                style={{ color: "var(--ink-soft)" }}
              >
                <span>{formatLongRange(next.weekStart, next.weekEnd)}</span>
                <span className="opacity-40">·</span>
                <span
                  className="bs-numerals tabular-nums"
                  style={{
                    color:
                      next.weeklyChange >= 0
                        ? "var(--color-positive)"
                        : "var(--color-negative)",
                  }}
                >
                  {next.weeklyChange >= 0 ? "+" : ""}
                  {next.weeklyChangePercent.toFixed(2)}%
                </span>
              </p>
              <p className="bs-label mt-4 text-[var(--stamp)] group-hover:translate-x-1 transition-transform inline-block">
                Read it &rarr;
              </p>
            </Link>
          )}

          {previous && (
            <p
              className={`bs-caption italic ${
                next ? "mt-6 pt-4 border-t border-[var(--color-border)]" : ""
              }`}
              style={{ color: "var(--ink-soft)" }}
            >
              &larr; Previously:{" "}
              <Link
                href={`/weekly/${previous.slug}`}
                className="bs-link"
                style={{ color: "var(--ink)" }}
              >
                {previous.title}
              </Link>
            </p>
          )}
        </div>
      )}

      {/* ── Newsletter ──────────────────────────────────────────── */}
      <div className="max-w-[65ch] mt-12 mb-4">
        <NewsletterSignup variant="section" />
      </div>
    </>
  );
}
