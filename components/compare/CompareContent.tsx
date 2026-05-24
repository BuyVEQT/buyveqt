"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CompareHero from "./CompareHero";
import MatchupPresets from "./MatchupPresets";
import FundPicker from "./FundPicker";
import type { ComparePeriod } from "./PerformanceChart";
import CompareGap from "./CompareGap";
import StatsTable from "./StatsTable";
import Verdict from "./Verdict";
import AllocationBars from "./AllocationBars";
import WhoThisSuits from "./WhoThisSuits";
import FAQSection from "./FAQSection";

// recharts is ~200KB gz — keep it out of the initial /compare bundle.
// The chart sits below the fold-ish content (hero + picker + stats table),
// so a brief loading state is fine. ssr:false because recharts measures
// container width on mount.
const PerformanceChart = dynamic(() => import("./PerformanceChart"), {
  ssr: false,
  loading: () => (
    <div
      className="skeleton"
      style={{ minHeight: 320, borderRadius: 12, width: "100%" }}
      aria-label="Loading performance chart…"
    />
  ),
});

interface CompareContentProps {
  initialFunds?: string[];
}

const DEFAULT_FUNDS = ["VEQT.TO", "XEQT.TO"];

function parseFundsParam(raw: string | null): string[] | null {
  if (!raw) return null;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : null;
}

function parsePeriodParam(raw: string | null): ComparePeriod | null {
  if (!raw) return null;
  const valid: ComparePeriod[] = ["1Y", "5Y", "ALL"];
  return (valid as string[]).includes(raw) ? (raw as ComparePeriod) : null;
}

/**
 * Round 4 Compare page assembly. Stacks per `12-compare.md` spec:
 *   Hero → MatchupPresets → FundPicker
 *   → 2-up (PerformanceChart | CompareGap-when-2)
 *   → StatsTable
 *   → 2-up (GeographyCard | Verdict)
 *   → 2-up (Suitability | FAQ)
 *
 * URL state: ?funds=VEQT.TO,XEQT.TO&period=1Y — both encoded on change,
 * so the page is shareable.
 */
function CompareContentInner({ initialFunds }: CompareContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const urlFunds = parseFundsParam(params.get("funds"));
  const urlPeriod = parsePeriodParam(params.get("period"));

  const [selected, setSelected] = useState<string[]>(
    initialFunds || urlFunds || DEFAULT_FUNDS
  );
  const [period, setPeriod] = useState<ComparePeriod>(urlPeriod || "1Y");

  // Sync state → URL (replaceState so we don't pollute history).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = new URLSearchParams(window.location.search);
    next.set("funds", selected.join(","));
    next.set("period", period);
    const qs = next.toString();
    const target = `${pathname}?${qs}`;
    if (window.location.search !== `?${qs}`) {
      router.replace(target, { scroll: false });
    }
  }, [selected, period, pathname, router]);

  const handleToggle = useCallback((ticker: string) => {
    setSelected((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  }, []);

  // Presets always replace selection; VEQT stays pinned at slot 0 by convention.
  const handlePreset = useCallback((funds: string[]) => {
    setSelected(funds);
  }, []);

  const twoUp: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 22,
  };

  return (
    <main
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        minHeight: "100dvh",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "20px 14px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
        className="compare-stack"
      >
        <CompareHero />

        <MatchupPresets selected={selected} onSelect={handlePreset} />
        <FundPicker selected={selected} onToggle={handleToggle} />

        <div className="compare-row" style={twoUp}>
          <PerformanceChart
            selected={selected}
            period={period}
            onPeriodChange={setPeriod}
          />
          {selected.length === 2 && (
            <CompareGap selected={selected} period={period} />
          )}
        </div>

        <StatsTable selected={selected} />

        <div className="compare-row" style={twoUp}>
          <AllocationBars selected={selected} />
          <Verdict selected={selected} />
        </div>

        <div className="compare-row" style={twoUp}>
          <WhoThisSuits selected={selected} />
          <FAQSection />
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          .compare-stack {
            padding: 32px 26px 56px !important;
            gap: 28px !important;
          }
          .compare-row {
            grid-template-columns: 7fr 5fr !important;
            gap: 22px !important;
          }
        }
      `}</style>
    </main>
  );
}

/**
 * Suspense wrapper — useSearchParams() bails static prerendering without
 * a Suspense boundary, so we split the inner client from the export.
 */
export default function CompareContent(props: CompareContentProps) {
  return (
    <Suspense
      fallback={
        <main
          style={{
            background: "var(--paper)",
            minHeight: "60dvh",
          }}
        />
      }
    >
      <CompareContentInner {...props} />
    </Suspense>
  );
}
