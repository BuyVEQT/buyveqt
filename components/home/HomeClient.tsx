"use client";

import { useVeqtData } from "@/lib/useVeqtData";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/HeroSection";
import PriceChart from "@/components/PriceChart";
import ChartSidebar from "@/components/ChartSidebar";
import InsideVeqtPreview from "@/components/InsideVeqtPreview";
import ComparePreview from "@/components/ComparePreview";
import LearnPreview from "@/components/LearnPreview";
import CalculatorsPreview from "@/components/CalculatorsPreview";
import CommunityWidget from "@/components/CommunityWidget";
import AnimateIn from "@/components/ui/AnimateIn";
import type { WeeklyRecap } from "@/lib/weekly";
import type { Distribution } from "@/data/distributions";

interface HomeClientProps {
  /** Latest published weekly recap — surfaced on the home page in PR 3. */
  latestRecap: WeeklyRecap | null;
  /** Latest confirmed (non-estimated) VEQT distribution — surfaced in PR 3. */
  latestDistribution: Distribution | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function HomeClient({ latestRecap, latestDistribution }: HomeClientProps) {
  const { data, loading, period, setPeriod } = useVeqtData();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar
        quote={data?.quote ?? null}
        loading={loading}
        isFallback={data?.isFallback ?? false}
        quoteSource={data?.quoteSource}
        quoteFetchedAt={data?.quoteFetchedAt}
      />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4">
        {/* 1. Hero */}
        <HeroSection
          quote={data?.quote ?? null}
          loading={loading}
          isFallback={data?.isFallback ?? false}
          quoteSource={data?.quoteSource}
          quoteFetchedAt={data?.quoteFetchedAt}
        />

        {/* 2. Price Chart + Sidebar */}
        <AnimateIn as="section" className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2">
              <PriceChart
                data={data?.historical ?? []}
                loading={loading}
                period={period}
                onPeriodChange={setPeriod}
                historySource={data?.historySource}
                historyFetchedAt={data?.historyFetchedAt}
              />
            </div>
            <ChartSidebar
              quote={data?.quote ?? null}
              loading={loading}
              quoteSource={data?.quoteSource}
              quoteFetchedAt={data?.quoteFetchedAt}
            />
          </div>
        </AnimateIn>

        {/* Editorial divider */}
        <div className="editorial-rule my-4" />

        {/* 3. Calculators */}
        <AnimateIn>
          <CalculatorsPreview />
        </AnimateIn>

        {/* 4. What's inside VEQT */}
        <AnimateIn>
          <InsideVeqtPreview />
        </AnimateIn>

        {/* 5. Comparison table */}
        <AnimateIn>
          <ComparePreview />
        </AnimateIn>

        {/* 6. Learn articles */}
        <AnimateIn>
          <LearnPreview />
        </AnimateIn>

        {/* Editorial divider */}
        <div className="editorial-rule my-4" />

        {/* 7. Community */}
        <AnimateIn>
          <CommunityWidget />
        </AnimateIn>
      </main>

      <Footer />
    </div>
  );
}
