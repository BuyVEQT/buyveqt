import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import CompareContent from "@/components/compare/CompareContent";
import { COMPARISON_PAGES, getComparison } from "@/data/comparisons";
import BottomLine from "@/components/compare/BottomLine";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(COMPARISON_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getComparison(slug);
  if (!page) return { title: "Comparison" };

  const url = canonicalUrl(`/compare/${slug}`);
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url,
    },
  };
}

export default async function CompareSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getComparison(slug);

  if (!page) {
    notFound();
  }

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
          { name: page.title, path: `/compare/${page.slug}` },
        ])}
      />

      {/* ── Page head ──────────────────────────────────────────── */}
      <section className="pt-8 sm:pt-10 pb-6 bs-enter">
        <p className="bs-stamp mb-3">A Single Bout</p>
        <h1
          className="bs-display text-[1.75rem] sm:text-[2.5rem] lg:text-[3rem] leading-[1.02]"
          style={{ color: "var(--ink)" }}
        >
          {page.title}
        </h1>
        <p
          className="bs-body mt-4 max-w-[64ch]"
          style={{ color: "var(--ink)" }}
        >
          {page.intro}
        </p>
      </section>

      <section className="bs-enter pb-10">
        <CompareContent initialFunds={[...page.funds]} />

        <BottomLine
          slug={slug}
          fundA={page.funds[0]}
          fundB={page.funds[1]}
          className="mt-8"
        />

        <div className="mt-10 pt-6 border-t border-[var(--ink)]">
          <Link
            href="/compare"
            className="bs-link bs-label"
            style={{ letterSpacing: "0.14em" }}
          >
            &larr; Back to all bouts
          </Link>
        </div>
      </section>
    </InteriorShell>
  );
}
