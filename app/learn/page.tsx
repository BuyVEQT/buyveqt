import { Suspense } from "react";
import type { Metadata } from "next";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import { getAllArticles } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import LearnContent from "@/components/learn/LearnContent";
import CourseCard from "@/components/learn/CourseCard";
import { COURSES } from "@/lib/learn";

export function generateMetadata(): Metadata {
  const count = getAllArticles().length;
  const description = `${count} dispatches on VEQT, Canadian ETFs, tax-advantaged accounts, and building a passive portfolio. Written in plain English for real investors.`;
  return {
    title: "Learn — VEQT & Canadian Passive Investing",
    description,
    alternates: { canonical: canonicalUrl("/learn") },
    openGraph: {
      title: "Learn — VEQT & Canadian Passive Investing",
      description:
        "Plain-English guides on VEQT, all-in-one ETFs, tax-advantaged accounts, and passive investing in Canada.",
      url: canonicalUrl("/learn"),
    },
  };
}

export default function LearnPage() {
  const all = getAllArticles();
  const count = all.length;

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ])}
      />

      <section className="pt-8 pb-4">
        <p className="bs-stamp mb-3">The Syllabus</p>
        <h1
          className="bs-display text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem] leading-[1]"
          style={{ color: "var(--ink)" }}
        >
          Three courses. Three articles each.{" "}
          <em className="bs-display-italic">In order.</em>
        </h1>
        <p
          className="bs-body italic mt-4 max-w-[58ch] text-[1rem] sm:text-[1.0625rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          A reading order, not a search engine. The first course teaches
          the fund; the second argues for the discipline; the third
          rehearses what to do when it stops being easy.
        </p>
      </section>

      {/* ── Three courses, side by side ────────────────────────── */}
      <section
        className="mt-8 pt-8 border-t-2 border-[var(--ink)] grid grid-cols-1 lg:grid-cols-3 lg:divide-x lg:divide-[color:var(--rule)] gap-y-10"
        aria-label="Courses"
      >
        {COURSES.map((course) => (
          <CourseCard key={course.number} course={course} />
        ))}
      </section>

      {/* ── Demoted archive ────────────────────────────────────── */}
      <section
        className="mt-14 sm:mt-20 pt-8 border-t-2 border-[var(--ink)]"
        aria-labelledby="archive-eyebrow"
      >
        <p
          id="archive-eyebrow"
          className="bs-stamp mb-3"
          style={{ color: "var(--ink-mute)" }}
        >
          Everything else, by topic
        </p>
        <p
          className="bs-body italic max-w-[60ch] mb-2 text-[0.9375rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          {count} dispatches in the back catalogue, grouped by
          subject. Filter, search, or scan.
        </p>
        <Suspense fallback={null}>
          <LearnContent articles={all} demoted />
        </Suspense>
      </section>
    </InteriorShell>
  );
}
