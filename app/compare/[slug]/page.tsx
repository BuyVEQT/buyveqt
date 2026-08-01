import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CompareContent from "@/components/compare/CompareContent";
import { COMPARISON_PAGES, getComparison } from "@/data/comparisons";
import BottomLine from "@/components/compare/BottomLine";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const css = `
.ins-cmp-slug {
  background: var(--ins-paper, #ffffff);
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmp-slug__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 48px;
}
.ins-cmp-slug__foot {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--ins-hair);
}
.ins-cmp-slug__back {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-ink);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-ink);
  padding-bottom: 3px;
}
.ins-cmp-slug__back:hover,
.ins-cmp-slug__back:focus-visible {
  color: var(--ins-signal);
  border-bottom-color: var(--ins-signal);
}

@media (max-width: 640px) {
  .ins-cmp-slug__inner { padding: 0 20px 32px; }
  /* The foot's top padding moves onto the link itself: it is the only
     thing in here, and putting the space inside the anchor buys the
     44px tap height without floating the 2px underline away from the
     words (24 + ~12 line box + 8 = 44). */
  .ins-cmp-slug__foot { margin-top: 22px; padding-top: 0; }
  .ins-cmp-slug__back {
    font-size: 10px;
    letter-spacing: 0.12em;
    padding: 24px 0 8px;
  }
}
`;

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
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
          { name: page.title, path: `/compare/${page.slug}` },
        ])}
      />
      <CompareContent initialFunds={[...page.funds]} />
      <div className="ins-root ins-cmp-slug">
        <div className="ins-cmp-slug__inner">
          <BottomLine
            slug={slug}
            fundA={page.funds[0]}
            fundB={page.funds[1]}
          />
          <div className="ins-cmp-slug__foot">
            <Link href="/compare" className="ins-cmp-slug__back">
              <span aria-hidden>&larr;</span> Back to all bouts
            </Link>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
