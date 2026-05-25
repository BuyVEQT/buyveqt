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

      {/* ── V2 Masthead ────────────────────────────────────────── */}
      <header className="v2-masthead">
        <div className="v2-masthead__top">
          <span className="ed-stamp">
            The wire · {recaps.length} {recaps.length === 1 ? "dispatch" : "dispatches"} on file · Filed Sundays
          </span>
          <span className="ed-stamp" style={{ color: "var(--ink-mute)" }}>
            {new Intl.DateTimeFormat("en-CA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(new Date())}
          </span>
        </div>
        <div className="v2-masthead__lockup">
          <h1 className="ed-display-italic v2-masthead__h1">
            Week by{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>week.</em>
          </h1>
          <p className="ed-body v2-masthead__lede">
            What moved this week, what drove it, and what — if anything —
            it changes for a 30-year hold. Brief by design.
          </p>
        </div>
        <style>{`
          .v2-masthead {
            padding: 26px 0 22px;
          }
          .v2-masthead__top {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
            flex-wrap: wrap;
            padding-bottom: 10px;
          }
          .v2-masthead__lockup {
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 18px 0 8px;
            border-top: 3px solid var(--ink);
            border-bottom: 1px solid var(--ink);
            align-items: end;
          }
          @media (min-width: 720px) {
            .v2-masthead__lockup {
              grid-template-columns: auto 1fr;
              gap: 40px;
              padding: 22px 0 12px;
            }
          }
          .v2-masthead__h1 {
            font-size: clamp(3rem, 8vw, 6rem);
            line-height: 1;
            letter-spacing: -0.035em;
            margin: 0;
            color: var(--ink);
            white-space: nowrap;
          }
          .v2-masthead__lede {
            font-size: clamp(15px, 1.6vw, 17.5px);
            line-height: 1.55;
            color: var(--ink-soft);
            margin: 0;
            max-width: 52ch;
            padding-bottom: 8px;
          }
        `}</style>
      </header>

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
                      className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-[1.15] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 transition-[text-decoration]"
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
        <section className="wire-news">
          <div className="wire-news__top">
            <span className="ed-stamp wire-news__masthead">
              Subscribe to The Wire
            </span>
            <span className="ed-stamp wire-news__edition">
              Sundays · One email · Free
            </span>
          </div>
          <div className="wire-news__rule" />
          <h2 className="ed-display-italic wire-news__h2">
            Get The Wire{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>
              in your inbox.
            </em>
          </h2>
          <p className="ed-body wire-news__copy">
            One short email Sunday evenings — what VEQT did, what drove it,
            and what (if anything) it changes for a 30-year hold.
          </p>
          <div className="wire-news__form">
            <NewsletterSignup variant="section" />
          </div>
          <style>{`
            .wire-news {
              margin-top: 48px;
              margin-bottom: 16px;
              padding: 28px 32px 26px;
              background: var(--band-ink);
              color: var(--band-paper);
              border-radius: 18px;
              position: relative;
              overflow: hidden;
            }
            .wire-news::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: var(--stamp);
            }
            .wire-news__top {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              gap: 12px;
              flex-wrap: wrap;
            }
            .wire-news__masthead {
              color: var(--paper);
              letter-spacing: 0.24em;
            }
            .wire-news__edition {
              color: rgba(246, 239, 220, 0.55);
            }
            .wire-news__rule {
              height: 1px;
              background: rgba(246, 239, 220, 0.22);
              margin: 12px 0 22px;
            }
            .wire-news__h2 {
              font-size: clamp(1.6rem, 2.6vw, 2.1rem);
              line-height: 1.1;
              color: var(--paper);
              margin: 0 0 12px;
              max-width: 18ch;
            }
            .wire-news__copy {
              font-size: 14.5px;
              line-height: 1.55;
              color: rgba(246, 239, 220, 0.78);
              margin: 0 0 18px;
              max-width: 56ch;
            }
          `}</style>
        </section>
      )}
    </InteriorShell>
  );
}
