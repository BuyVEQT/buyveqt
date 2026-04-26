import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import PathDetail from "@/components/learn/PathDetail";
import { LEARN_PATHS } from "@/lib/learn-paths-data";
import { getAllArticles } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export function generateStaticParams() {
  return LEARN_PATHS.map((path) => ({ id: path.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const path = LEARN_PATHS.find((p) => p.id === id);
  if (!path) return { title: "Path Not Found" };

  const url = canonicalUrl(`/learn/path/${id}`);
  const description = `${path.description} A guided reading path for Canadian passive investors.`;

  return {
    title: `${path.title} — Learn Path`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${path.title} — Learn Path`,
      description,
      url,
    },
  };
}

export default async function PathDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const path = LEARN_PATHS.find((p) => p.id === id);

  if (!path) {
    notFound();
  }

  const articles = getAllArticles();

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
          { name: path.title, path: `/learn/path/${id}` },
        ])}
      />
      <PathDetail path={path} articles={articles} />
    </InteriorShell>
  );
}
