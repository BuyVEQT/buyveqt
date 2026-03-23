import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import ArticleLayout from "@/components/learn/ArticleLayout";
import { getArticleBySlug, getAllSlugs } from "@/lib/articles";

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
  if (!article) return { title: "Article Not Found — BuyVEQT" };

  return {
    title: `${article.frontmatter.title} — BuyVEQT`,
    description: article.frontmatter.description,
    openGraph: {
      title: `${article.frontmatter.title} — BuyVEQT`,
      description: article.frontmatter.description,
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
      <ArticleLayout
        frontmatter={article.frontmatter}
        content={article.content}
      />
    </PageShell>
  );
}
