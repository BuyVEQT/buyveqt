import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import ArticleLayout from "@/components/learn/ArticleLayout";
import { getArticleBySlug, getAllSlugs } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl, SITE_NAME } from "@/lib/seo-config";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  const url = canonicalUrl(`/learn/${slug}`);
  const description =
    article.frontmatter.excerpt ||
    article.frontmatter.description ||
    `Learn about ${article.frontmatter.title} — a guide for Canadian passive investors.`;

  return {
    title: article.frontmatter.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.frontmatter.title,
      description,
      url,
      publishedTime: article.frontmatter.lastUpdated,
      modifiedTime: article.frontmatter.updatedDate || article.frontmatter.lastUpdated,
      authors: ["BuyVEQT"],
      section: "Education",
    },
  };
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
          { name: article.frontmatter.title, path: `/learn/${slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.frontmatter.title,
          description: article.frontmatter.excerpt || article.frontmatter.description,
          datePublished: article.frontmatter.lastUpdated,
          dateModified: article.frontmatter.updatedDate || article.frontmatter.lastUpdated,
          author: {
            "@type": "Organization",
            name: SITE_NAME,
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: canonicalUrl(),
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl(`/learn/${slug}`),
          },
        }}
      />
      <ArticleLayout
        frontmatter={article.frontmatter}
        content={article.content}
      />
    </PageShell>
  );
}
