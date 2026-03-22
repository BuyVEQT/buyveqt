import PageShell from "@/components/layout/PageShell";
import StubPage from "@/components/StubPage";

export default async function CompareSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.toUpperCase())
    .join(" ");

  return (
    <PageShell>
      <StubPage
        title={title}
        description="Detailed ETF comparison coming soon."
      />
    </PageShell>
  );
}
