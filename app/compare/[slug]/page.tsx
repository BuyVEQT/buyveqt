import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import CompareContent from "@/components/compare/CompareContent";
import { COMPARISON_PAGES, getComparison } from "@/data/comparisons";
import BottomLine from "@/components/compare/BottomLine";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

function EditorialCallout() {
  return (
    <Link
      href="/learn/why-we-choose-veqt-over-xeqt"
      className="block rounded-lg border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/[0.04] p-4 hover:border-[var(--color-brand)]/60 transition-colors"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-1">
        Our Take
      </p>
      <p className="text-sm font-medium text-[var(--color-text-primary)]">
        Read our editorial: Why We Choose VEQT Over XEQT &rarr;
      </p>
    </Link>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
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
          <div className="mt-6">
            <EditorialCallout />
          </div>
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
