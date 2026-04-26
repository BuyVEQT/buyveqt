import { Suspense } from "react";
import type { Metadata } from "next";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import { getAllArticles } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import LearnContent from "@/components/learn/LearnContent";

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
        <p className="bs-stamp mb-3">The Archive</p>
        <h1
          className="bs-display text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem] leading-[0.95]"
          style={{ color: "var(--ink)" }}
        >
          Learn.
        </h1>
        <p
          className="bs-body italic mt-3 max-w-[54ch] text-[1rem] sm:text-[1.0625rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          {count} dispatches on VEQT and Canadian passive investing. Pick a
          path, or browse the archive.
        </p>
      </section>

      <Suspense fallback={null}>
        <LearnContent articles={all} />
      </Suspense>
    </InteriorShell>
  );
}
