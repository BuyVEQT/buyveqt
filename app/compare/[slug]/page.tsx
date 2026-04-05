import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import CompareContent from "@/components/compare/CompareContent";
import { COMPARISON_PAGES, getComparison } from "@/data/comparisons";
import BottomLine from "@/components/compare/BottomLine";
import EditorialCTA from "@/components/compare/EditorialCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

function EditorialCallout() {
  return (
    <div className="rounded-lg border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/[0.04] p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-2">
        Beyond the Numbers
      </p>
      <p className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-2">
        The spreadsheet says they&apos;re the same. The ownership structure says otherwise.
      </p>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 max-w-prose">
        Vanguard is owned by its investors. BlackRock is owned by Wall Street.
        When two funds perform identically, the tiebreaker is trust &mdash; and
        trust favours the company that was built to serve you.
      </p>
      <Link
        href="/learn/veqt-vs-xeqt"
        className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-colors"
      >
        Read: VEQT vs XEQT &rarr;
      </Link>
    </div>
  );
}

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
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
          { name: page.title, path: `/compare/${page.slug}` },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--color-text-primary)]">
            {page.title}
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose leading-relaxed">
            {page.intro}
          </p>
        </div>

        <CompareContent initialFunds={[...page.funds]} />

        <BottomLine
          slug={slug}
          fundA={page.funds[0]}
          fundB={page.funds[1]}
        />

        {slug === "veqt-vs-xeqt" && (
          <>
            <div className="mt-6">
              <EditorialCallout />
            </div>
            <EditorialCTA />
          </>
        )}

        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <Link
            href="/compare"
            className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
          >
            &larr; Compare more funds
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
