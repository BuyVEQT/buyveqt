"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getVerdict } from "@/lib/compare-verdicts";
import CompareSetup from "./CompareSetup";
import FaceoffBanner from "./FaceoffBanner";
import type { ComparePeriod } from "./PerformanceChart";
import CompareGap from "./CompareGap";
import StatsTable from "./StatsTable";
import Verdict from "./Verdict";
import AllocationBars from "./AllocationBars";
import WhoThisSuits from "./WhoThisSuits";
import FAQSection from "./FAQSection";
import Scorecard from "./Scorecard";

// Custom SVG chart — no recharts. Still lazy-loaded because it fetches data
// on mount and lives below-the-fold. ssr:false because it uses mouse events.
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
 * V2 Compare page assembly:
 *   CompareSetup (collapsed hero + presets + picker)
 *   FaceoffBanner (when 2 funds)
 *   2-up: PerformanceChart | CompareGap-when-2
 *   StatsTable
 *   2-up: AllocationBars | Verdict
 *   Scorecard (when 2 funds)
 *   2-up: WhoThisSuits | FAQSection
 *
 * URL state: ?funds=VEQT.TO,XEQT.TO&period=1Y — both encoded on change.
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

  // Presets always replace selection; VEQT stays pinned at slot 0.
  const handlePreset = useCallback((funds: string[]) => {
    setSelected(funds);
  }, []);

  // Which optional widgets will actually render? Used to collapse the
  // two-up rows to single-column when the right-side widget is absent,
  // so the chart / allocation bars stretch to fill the row instead of
  // leaving a wide empty band on the right.
  const isPair = selected.length === 2;
  const hasGap = isPair;
  const hasVerdict = useMemo(
    () => (isPair ? Boolean(getVerdict(selected[0], selected[1])) : false),
    [isPair, selected]
  );

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
        <CompareSetup
          selected={selected}
          onPreset={handlePreset}
          onToggle={handleToggle}
        />

        {selected.length === 2 && (
          <FaceoffBanner selected={selected} />
        )}

        <div
          className={`compare-row${hasGap ? " compare-row--two" : ""}`}
          style={twoUp}
        >
          <PerformanceChart
            selected={selected}
            period={period}
            onPeriodChange={setPeriod}
          />
          {hasGap && <CompareGap selected={selected} period={period} />}
        </div>

        <StatsTable selected={selected} />

        <div
          className={`compare-row${hasVerdict ? " compare-row--two" : ""}`}
          style={twoUp}
        >
          <AllocationBars selected={selected} />
          {hasVerdict && <Verdict selected={selected} />}
        </div>

        {selected.length === 2 && (
          <Scorecard selected={selected} />
        )}

        <div className="compare-row compare-row--two" style={twoUp}>
          <WhoThisSuits selected={selected} />
          <FAQSection />
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .compare-stack {
            padding: 32px 26px 56px !important;
            gap: 28px !important;
          }
          /* Default desktop row: single column. The 7fr/5fr split only
             kicks in when both children render — driven by the
             .compare-row--two modifier set in JSX based on hasGap /
             hasVerdict. This way the chart and allocation bars stretch
             to full width whenever their right-hand sibling is absent
             (e.g. user picks a non-curated 2-fund pair, or selects 1
             or 3+ funds — no CompareGap, no curated Verdict). */
          .compare-row {
            grid-template-columns: 1fr !important;
            gap: 22px !important;
          }
          .compare-row.compare-row--two {
            grid-template-columns: 7fr 5fr !important;
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
