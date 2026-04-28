"use client";

import { useEffect, useMemo, useState } from "react";
import { useVeqtData } from "@/lib/useVeqtData";
import { computeSeverity } from "@/lib/severity";
import SeverityMeter from "./SeverityMeter";

interface Props {
  compact?: boolean;
}

/**
 * Self-wiring SeverityMeter — fetches VEQT data and full history, then
 * renders the meter. Used by interior pages (/invest, /learn/veqt-is-down)
 * that want the same severity reading as the home page without hand-rolling
 * the data hook themselves. The home page wires SeverityMeter directly so
 * it can share the same fullHistory fetch with the heatmap and chart.
 */
export default function SeverityMeterAuto({ compact = false }: Props) {
  const { data, loading } = useVeqtData();
  const [fullHistory, setFullHistory] = useState<
    { date: string; close: number }[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/veqt?period=ALL");
        if (!res.ok) return;
        const json = (await res.json()) as {
          historical?: { date: string; close: number }[];
        };
        if (!cancelled && json.historical?.length) {
          setFullHistory(json.historical);
        }
      } catch {
        // Silent — fall back to the default-window history already in `data`.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const severity = useMemo(() => {
    const source = fullHistory ?? data?.historical ?? [];
    return computeSeverity(source, data?.quote?.changePercent);
  }, [fullHistory, data?.historical, data?.quote?.changePercent]);

  return (
    <SeverityMeter reading={severity} loading={loading} compact={compact} />
  );
}
