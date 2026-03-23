"use client";

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
import CommunityStrip from "@/components/CommunityStrip";

export default function Home() {
  const { data, loading, period, setPeriod } = useVeqtData();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar
        quote={data?.quote ?? null}
        loading={loading}
        isFallback={data?.isFallback ?? false}
      />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4">
        {/* Section 1: Hero */}
        <HeroSection
          quote={data?.quote ?? null}
          loading={loading}
          isFallback={data?.isFallback ?? false}
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
              />
            </div>
            <SidebarCards />
          </div>
        </section>

        {/* Section 3: What's Inside VEQT */}
        <InsideVeqtPreview />

        {/* Section 4: Compare Preview */}
        <ComparePreview />

        {/* Section 5: Learn Preview */}
        <LearnPreview />

        {/* Section 6: Calculators Preview */}
        <CalculatorsPreview />

        {/* Section 7: Community */}
        <CommunityStrip />
      </main>

      <Footer />
    </div>
  );
}
