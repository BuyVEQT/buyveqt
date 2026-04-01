import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getAllWeeklyRecaps } from "@/lib/weekly";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "VEQT This Week — Weekly Market Recaps",
  description:
    "Weekly recaps of VEQT performance, market drivers, and what matters for Canadian passive investors.",
  alternates: { canonical: canonicalUrl("/weekly") },
  openGraph: {
    title: "VEQT This Week",
    description:
      "Short, useful weekly recaps for VEQT investors.",
    url: canonicalUrl("/weekly"),
  },
};

export default function WeeklyPage() {
  const recaps = getAllWeeklyRecaps();

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Weekly", path: "/weekly" },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
          VEQT This Week
        </h1>

        {recaps.length === 0 ? (
          <>
            <p className="mt-3 text-[var(--color-text-muted)] max-w-prose">
              We&apos;re building a weekly recap for VEQT investors — short,
              useful updates on what moved and why. Leave your email to get
              notified when we launch.
            </p>
            <div className="mt-6">
              <NewsletterSignup variant="section" />
            </div>
          </>
        ) : (
          <div className="mt-6 space-y-4">
            {recaps.map((recap) => {
              const isPos = recap.weeklyChange >= 0;
              return (
                <Link
                  key={recap.slug}
                  href={`/weekly/${recap.slug}`}
                  className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 hover:border-[var(--color-brand)] hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {recap.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {new Date(recap.weekStart).toLocaleDateString(
                          "en-CA",
                          { month: "short", day: "numeric" }
                        )}{" "}
                        &ndash;{" "}
                        {new Date(recap.weekEnd).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isPos ? "text-[#15803d]" : "text-[#b91c1c]"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {recap.weeklyChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </PageShell>
  );
}
