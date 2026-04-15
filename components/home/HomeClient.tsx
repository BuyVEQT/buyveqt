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
import DailyPulse from "@/components/home/DailyPulse";
import WeeklyRecapCard from "@/components/home/WeeklyRecapCard";
import DistributionCard from "@/components/home/DistributionCard";
import CountdownToNextBrief from "@/components/home/CountdownToNextBrief";
import NewsletterSignup from "@/components/NewsletterSignup";
import type { WeeklyRecap } from "@/lib/weekly";
import type { Distribution } from "@/data/distributions";

interface HomeClientProps {
  /** Latest published weekly recap — surfaced on the home page in PR 3. */
  latestRecap: WeeklyRecap | null;
  /** Latest confirmed (non-estimated) VEQT distribution — surfaced in PR 3. */
  latestDistribution: Distribution | null;
}

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

        {/* 2. Daily Pulse — regional attribution + hold line */}
        <DailyPulse dailyChangePercent={data?.quote?.changePercent ?? null} />

        {/* 3. Price Chart + Sidebar */}
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

        {/* 4. Weekly recap + countdown + latest distribution */}
        <AnimateIn as="section" className="py-6 space-y-4">
          <WeeklyRecapCard recap={latestRecap} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CountdownToNextBrief />
            <DistributionCard
              distribution={latestDistribution}
              currentPrice={data?.quote?.price ?? null}
            />
          </div>
        </AnimateIn>

        {/* 5. Calculators */}
        <AnimateIn>
          <CalculatorsPreview />
        </AnimateIn>

        {/* 6. What's inside VEQT */}
        <AnimateIn>
          <InsideVeqtPreview />
        </AnimateIn>

        {/* 7. Comparison table */}
        <AnimateIn>
          <ComparePreview />
        </AnimateIn>

        {/* 8. Learn articles */}
        <AnimateIn>
          <LearnPreview />
        </AnimateIn>

        {/* 9. Newsletter CTA (prominent section variant) */}
        <AnimateIn as="section" className="py-8">
          <div className="card-editorial p-6 sm:p-8 text-center">
            <p className="section-label">The Weekly Brief</p>
            <h2 className="font-serif text-2xl sm:text-3xl mt-2 text-[var(--color-text-primary)]">
              Get Sunday&apos;s recap in your inbox.
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
              One email per week. Short, human-written, and specifically for
              VEQT investors. No hot takes.
            </p>
            <div className="mt-5 max-w-md mx-auto">
              <NewsletterSignup variant="section" />
            </div>
          </div>
        </AnimateIn>

        {/* Editorial divider */}
        <div className="editorial-rule my-4" />

        {/* 10. Community */}
        <AnimateIn>
          <CommunityWidget />
        </AnimateIn>
      </main>

      <Footer />
    </div>
  );
}
