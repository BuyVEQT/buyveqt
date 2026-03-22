"use client";

import { useVeqtData } from "@/lib/useVeqtData";
import NavBar from "@/components/NavBar";
import StatsStrip from "@/components/StatsStrip";
import PriceChart from "@/components/PriceChart";
import AllocationChart from "@/components/AllocationChart";
import WhatIsVeqt from "@/components/WhatIsVeqt";
import CommunityCard from "@/components/CommunityCard";
import Footer from "@/components/Footer";

export default function Home() {
  const { data, loading, period, setPeriod } = useVeqtData();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar
        quote={data?.quote ?? null}
        loading={loading}
        isFallback={data?.isFallback ?? false}
      />
      <StatsStrip quote={data?.quote ?? null} loading={loading} />

      {/* Dashboard Grid */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Primary: Price Chart (spans 2 cols on desktop) */}
          <div className="lg:col-span-2">
            <PriceChart
              data={data?.historical ?? []}
              loading={loading}
              period={period}
              onPeriodChange={setPeriod}
            />
          </div>

          {/* Sidebar widgets */}
          <div className="flex flex-col gap-4">
            <AllocationChart />
            <WhatIsVeqt />
            <CommunityCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
