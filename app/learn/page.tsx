import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Learn About VEQT — BuyVEQT",
  description:
    "Guides, explainers, and educational resources for VEQT investors. Learn about all-in-one ETFs, tax implications, and portfolio strategy.",
  openGraph: {
    title: "Learn About VEQT — BuyVEQT",
    description: "Educational resources for VEQT investors.",
  },
};

export default function LearnPage() {
  return (
    <PageShell>
      <StubPage
        title="Learn"
        description="Guides, explainers, and educational resources for VEQT investors. Coming soon."
      />
    </PageShell>
  );
}
