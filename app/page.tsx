"use client";

import { useVeqtData } from "@/lib/useVeqtData";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import Explainer from "@/components/Explainer";
import PriceChart from "@/components/PriceChart";
import AllocationChart from "@/components/AllocationChart";
import Footer from "@/components/Footer";

export default function Home() {
  const { data, loading, period, setPeriod } = useVeqtData();

  return (
    <main>
      <Hero
        quote={data?.quote ?? null}
        loading={loading}
        isFallback={data?.isFallback ?? false}
      />
      <StatsBar quote={data?.quote ?? null} loading={loading} />
      <Explainer />
      <PriceChart
        data={data?.historical ?? []}
        loading={loading}
        period={period}
        onPeriodChange={setPeriod}
      />
      <AllocationChart />
      <Footer />
    </main>
  );
}
