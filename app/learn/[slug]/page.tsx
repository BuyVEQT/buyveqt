import PageShell from "@/components/layout/PageShell";
import StubPage from "@/components/StubPage";

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <PageShell>
      <StubPage
        title={title}
        description="This article is coming soon. Check back later."
      />
    </PageShell>
  );
}
