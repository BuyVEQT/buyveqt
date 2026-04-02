"use client";

import { useState } from "react";
import { useVeqtData } from "@/lib/useVeqtData";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/HeroSection";
import PriceChart from "@/components/PriceChart";
import SidebarCards from "@/components/SidebarCards";
import InsideVeqtPreview from "@/components/InsideVeqtPreview";
import ComparePreview from "@/components/ComparePreview";
import LearnPreview from "@/components/LearnPreview";
import CalculatorsPreview from "@/components/CalculatorsPreview";
import CommunityWidget from "@/components/CommunityWidget";
import TodaySnapshot from "@/components/TodaySnapshot";

type HomeView = "overview" | "today";

export default function Home() {
  const { data, loading, period, setPeriod } = useVeqtData();
  const [view, setView] = useState<HomeView>("overview");

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
        {/* View Toggle */}
        <div className="pt-6 flex justify-center">
          <div className="inline-flex rounded-lg bg-[var(--color-base)] p-1 gap-1">
            <button
              onClick={() => setView("overview")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                view === "overview"
                  ? "bg-[var(--color-card)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setView("today")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                view === "today"
                  ? "bg-[var(--color-card)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              VEQT Today
            </button>
          </div>
        </div>

        {view === "overview" ? (
          <>
            {/* Section 1: Hero */}
            <HeroSection
              quote={data?.quote ?? null}
              loading={loading}
              isFallback={data?.isFallback ?? false}
              quoteSource={data?.quoteSource}
              quoteFetchedAt={data?.quoteFetchedAt}
            />

            {/* Section 2: Price Chart + Sidebar */}
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
                <SidebarCards />
              </div>
            </section>
          </>
        ) : (
          <TodaySnapshot
            quote={data?.quote ?? null}
            historical={data?.historical ?? []}
            loading={loading}
            quoteSource={data?.quoteSource}
            quoteFetchedAt={data?.quoteFetchedAt}
          />
        )}

        {/* Below-the-fold sections always visible */}
        <InsideVeqtPreview />
        <ComparePreview />
        <LearnPreview />

        {/* Section 6: Calculators Preview */}
        <CalculatorsPreview />

        {/* Section 7: Community */}
        <CommunityWidget />
      </main>

      <Footer />
    </div>
  );
}
