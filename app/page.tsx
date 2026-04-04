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

export default function Home() {
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
        <section className="py-6">
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
              historical={data?.historical ?? []}
              loading={loading}
              quoteSource={data?.quoteSource}
              quoteFetchedAt={data?.quoteFetchedAt}
            />
          </div>
        </section>

        {/* 3. Calculators (moved up) */}
        <CalculatorsPreview />

        {/* 4. What's inside VEQT */}
        <InsideVeqtPreview />

        {/* 5. Comparison table */}
        <ComparePreview />

        {/* 6. Learn articles */}
        <LearnPreview />

        {/* 7. Community */}
        <CommunityWidget />
      </main>

      <Footer />
    </div>
  );
}
