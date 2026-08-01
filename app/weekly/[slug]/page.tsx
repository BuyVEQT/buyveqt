import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WeeklyDispatchLayout from "@/components/weekly/WeeklyDispatchLayout";
import {
  getAllWeeklyRecaps,
  getWeeklyRecapBySlug,
  getAdjacentRecaps,
  getRecapOrdinal,
} from "@/lib/weekly";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl, SITE_NAME } from "@/lib/seo-config";

/**
 * With content/weekly holding only `_template.mdx`, lib/weekly filters the
 * underscore file out and this returns [] — the route builds with zero
 * static pages and the index shows its first-issue notice. Keep it that
 * way: the layout below is ready for the day an issue lands.
 */
export function generateStaticParams() {
  return getAllWeeklyRecaps().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recap = getWeeklyRecapBySlug(slug);
  if (!recap) return { title: "Recap Not Found" };

  const url = canonicalUrl(`/weekly/${slug}`);

  return {
    title: recap.title,
    description: recap.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: recap.title,
      description: recap.description,
      url,
      publishedTime: recap.date,
      authors: ["BuyVEQT"],
      section: "Weekly Wire",
    },
  };
}

/**
 * /weekly/[slug] — the issue reader, in the Instrument grammar.
 *
 * This file owns the landmark and the JSON-LD; <WeeklyDispatchLayout> owns
 * the page column, the reader chrome, and every `wkd-*` rule. The global
 * shell supplies nav and footer.
 */
export default async function WeeklyRecapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recap = getWeeklyRecapBySlug(slug);

  if (!recap) {
    notFound();
  }

  const ordinal = getRecapOrdinal(slug);
  const total = getAllWeeklyRecaps().length;
  const { previous, next } = getAdjacentRecaps(slug);

  return (
    <main className="ins-root wkd">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Weekly", path: "/weekly" },
          { name: recap.title, path: `/weekly/${slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: recap.title,
          description: recap.description,
          datePublished: recap.date,
          dateModified: recap.date,
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: canonicalUrl(),
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl(`/weekly/${slug}`),
          },
        }}
      />
      <WeeklyDispatchLayout
        recap={recap}
        ordinal={ordinal}
        total={total}
        previous={previous}
        next={next}
      />
    </main>
  );
}
