"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { track } from "@vercel/analytics";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { HistoricalData } from "@/lib/data/types";
import DataFreshness from "@/components/ui/DataFreshness";
import DataUnavailable from "@/components/ui/DataUnavailable";

type Mode = "lump" | "dca";

interface InvestCalculatorProps {
  history: HistoricalData | null;
}

// ─── Helpers ──────────────────────────────────────────────────

function formatDollars(n: number): string {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (months < 1) months = 1;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  if (rem === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} year${years !== 1 ? "s" : ""}, ${rem} month${rem !== 1 ? "s" : ""}`;
}

/** Find first date on or after target in sorted data */
function snapToTradingDay(
  data: HistoricalData["data"],
  target: string
): number {
  for (let i = 0; i < data.length; i++) {
    if (data[i].date >= target) return i;
  }
  return -1;
}

// ─── Lump Sum Calculation ─────────────────────────────────────

interface LumpResult {
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  investmentAmount: number;
  startDate: string;
  endDate: string;
  chartData: { date: string; value: number; invested: number }[];
}

function calcLumpSum(
  data: HistoricalData["data"],
  amount: number,
  startDate: string
): LumpResult | null {
  const startIdx = snapToTradingDay(data, startDate);
  if (startIdx < 0 || startIdx >= data.length - 1) return null;

  const entryPrice = data[startIdx].adjustedClose;
  if (entryPrice <= 0) return null;

  const shares = amount / entryPrice;
  const lastPoint = data[data.length - 1];
  const currentValue = shares * lastPoint.adjustedClose;
  const totalReturn = currentValue - amount;

  // Sample chart data — every Nth point for performance
  const points = data.slice(startIdx);
  const step = Math.max(1, Math.floor(points.length / 200));
  const chartData = points
    .filter((_, i) => i === 0 || i === points.length - 1 || i % step === 0)
    .map((p) => ({
      date: p.date,
      value: parseFloat((shares * p.adjustedClose).toFixed(2)),
      invested: amount,
    }));

  return {
    currentValue,
    totalReturn,
    totalReturnPercent: (totalReturn / amount) * 100,
    investmentAmount: amount,
    startDate: data[startIdx].date,
    endDate: lastPoint.date,
    chartData,
  };
}

// ─── DCA Calculation ──────────────────────────────────────────

interface DCAResult {
  currentValue: number;
  totalContributed: number;
  totalReturn: number;
  totalReturnPercent: number;
  contributions: number;
  startDate: string;
  endDate: string;
  chartData: {
    date: string;
    value: number;
    contributed: number;
  }[];
}

function calcDCA(
  data: HistoricalData["data"],
  monthly: number,
  startDate: string
): DCAResult | null {
  const startIdx = snapToTradingDay(data, startDate);
  if (startIdx < 0 || startIdx >= data.length - 1) return null;

  // Generate monthly contribution dates
  const start = new Date(startDate + "T00:00:00");
  const contributionDates: string[] = [];
  const current = new Date(start);
  const lastDate = data[data.length - 1].date;

  while (true) {
    const dateStr = current.toISOString().split("T")[0];
    if (dateStr > lastDate) break;
    contributionDates.push(dateStr);
    current.setMonth(current.getMonth() + 1);
  }

  if (contributionDates.length === 0) return null;

  // Process contributions
  let totalShares = 0;
  let totalContributed = 0;
  const sharesByDate: { date: string; totalShares: number; totalContributed: number }[] = [];

  for (const contribDate of contributionDates) {
    const idx = snapToTradingDay(data, contribDate);
    if (idx < 0) continue;
    const price = data[idx].adjustedClose;
    if (price <= 0) continue;
    totalShares += monthly / price;
    totalContributed += monthly;
    sharesByDate.push({
      date: data[idx].date,
      totalShares,
      totalContributed,
    });
  }

  if (sharesByDate.length === 0) return null;

  const lastPoint = data[data.length - 1];
  const currentValue = totalShares * lastPoint.adjustedClose;
  const totalReturn = currentValue - totalContributed;

  // Build chart data — track value and contributions over time
  const points = data.slice(startIdx);
  const step = Math.max(1, Math.floor(points.length / 200));
  let contribIdx = 0;
  let sharesAtDate = 0;
  let contributedAtDate = 0;

  const chartData = points
    .filter((_, i) => i === 0 || i === points.length - 1 || i % step === 0)
    .map((p) => {
      // Advance contribution tracker
      while (
        contribIdx < sharesByDate.length &&
        sharesByDate[contribIdx].date <= p.date
      ) {
        sharesAtDate = sharesByDate[contribIdx].totalShares;
        contributedAtDate = sharesByDate[contribIdx].totalContributed;
        contribIdx++;
      }
      return {
        date: p.date,
        value: parseFloat((sharesAtDate * p.adjustedClose).toFixed(2)),
        contributed: contributedAtDate,
      };
    });

  return {
    currentValue,
    totalContributed,
    totalReturn,
    totalReturnPercent: (totalReturn / totalContributed) * 100,
    contributions: sharesByDate.length,
    startDate: data[startIdx].date,
    endDate: lastPoint.date,
    chartData,
  };
}

// ─── Chart Tooltip ────────────────────────────────────────────

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const date = new Date(label + "T00:00:00");
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 shadow-lg text-sm">
      <p className="text-[11px] text-[var(--color-text-muted)] mb-1">
        {date.toLocaleDateString("en-CA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-[var(--color-text-muted)]">
            {p.dataKey === "value"
              ? "Portfolio"
              : p.dataKey === "contributed"
              ? "Contributed"
              : "Invested"}
          </span>
          <span className="ml-auto font-medium tabular-nums">
            {formatDollars(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function InvestCalculator({ history }: InvestCalculatorProps) {
  // Derive date constraints from data
  const earliestDate = history?.data[0]?.date ?? "2019-01-29";
  const latestDate = history?.data[history.data.length - 1]?.date ?? "";

  // A month ago for max start date
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const maxStartDate = oneMonthAgo.toISOString().split("T")[0];

  // Default start: 1 year ago
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const defaultStart = oneYearAgo.toISOString().split("T")[0];

  // Read URL params on mount
  const [mode, setMode] = useState<Mode>("lump");
  const [amount, setAmount] = useState(10000);
  const [amountInput, setAmountInput] = useState("10,000");
  const [startDate, setStartDate] = useState(
    defaultStart < earliestDate ? earliestDate : defaultStart
  );
  const [initialized, setInitialized] = useState(false);

  // Initialize from URL params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get("mode");
    const urlAmount = params.get("amount");
    const urlStart = params.get("start");

    if (urlMode === "lump" || urlMode === "dca") setMode(urlMode);
    if (urlAmount) {
      const n = parseFloat(urlAmount);
      if (!isNaN(n) && n >= 100 && n <= 1_000_000) {
        setAmount(n);
        setAmountInput(n.toLocaleString("en-CA"));
      }
    }
    if (urlStart && urlStart >= earliestDate && urlStart <= maxStartDate) {
      setStartDate(urlStart);
    }
    setInitialized(true);
  }, [earliestDate, maxStartDate]);

  // Update URL when inputs change
  const updateURL = useCallback(() => {
    if (!initialized || typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("mode", mode);
    params.set("amount", amount.toString());
    params.set("start", startDate);
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", url);
  }, [mode, amount, startDate, initialized]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Handle amount input
  function handleAmountChange(raw: string) {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    if (!isNaN(n)) {
      setAmount(Math.min(1_000_000, Math.max(0, n)));
      setAmountInput(n.toLocaleString("en-CA"));
    } else {
      setAmountInput(raw);
    }
  }

  // Calculate results
  const result = useMemo(() => {
    if (!history || history.data.length < 2) return null;
    if (amount < 100 || amount > 1_000_000) return null;
    if (startDate < earliestDate || startDate > maxStartDate) return null;

    if (mode === "lump") {
      return calcLumpSum(history.data, amount, startDate);
    } else {
      return calcDCA(history.data, amount, startDate);
    }
  }, [history, mode, amount, startDate, earliestDate, maxStartDate]);

  // Validation messages
  const validationMsg = useMemo(() => {
    if (amount < 100) return "Please enter an amount of at least $100";
    if (amount > 1_000_000) return "Maximum amount is $1,000,000";
    if (startDate < earliestDate)
      return `VEQT data is available from ${new Date(earliestDate + "T00:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}. Please select a later start date.`;
    if (startDate > maxStartDate)
      return "Pick an earlier start date to see results.";
    return null;
  }, [amount, startDate, earliestDate, maxStartDate]);

  // Track calculator usage (once per session)
  const tracked = useRef(false);
  useEffect(() => {
    if (result && !tracked.current) {
      tracked.current = true;
      track("calculator_used", { type: "if-you-invested", mode });
    }
  }, [result, mode]);

  if (!history) {
    return <DataUnavailable type="chart" message="Historical data is temporarily unavailable. Please try again later." />;
  }

  const isPositive = result ? result.totalReturn >= 0 : true;
  const isDCA = mode === "dca";

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex rounded-lg bg-[var(--color-base)] p-1 gap-1">
        <button
          onClick={() => {
            setMode("lump");
            setAmount(10000);
            setAmountInput("10,000");
          }}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
            mode === "lump"
              ? "bg-white text-[var(--color-text-primary)] shadow-sm"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          Lump Sum
        </button>
        <button
          onClick={() => {
            setMode("dca");
            setAmount(500);
            setAmountInput("500");
          }}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
            mode === "dca"
              ? "bg-white text-[var(--color-text-primary)] shadow-sm"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          Monthly (DCA)
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
            {isDCA ? "Monthly contribution" : "Investment amount"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white pl-7 pr-3 py-2.5 text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            min={earliestDate}
            max={maxStartDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)]"
          />
        </div>
      </div>

      {/* Validation message */}
      {validationMsg && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {validationMsg}
        </p>
      )}

      {/* Results */}
      {result && !validationMsg && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              label="Current value"
              value={formatDollars(result.currentValue)}
              highlight
              positive={isPositive}
            />
            <StatCard
              label="Total return"
              value={`${isPositive ? "+" : "\u2212"}${formatDollars(Math.abs(result.totalReturn))}`}
              positive={isPositive}
            />
            <StatCard
              label="Return %"
              value={`${isPositive ? "+" : "\u2212"}${Math.abs(result.totalReturnPercent).toFixed(2)}%`}
              positive={isPositive}
            />
            <StatCard
              label={isDCA ? "Total contributed" : "Invested"}
              value={formatDollars(
                isDCA
                  ? (result as DCAResult).totalContributed
                  : (result as LumpResult).investmentAmount
              )}
            />
            <StatCard
              label="Time period"
              value={formatPeriod(result.startDate, result.endDate)}
              className={isDCA ? "" : "col-span-2 sm:col-span-1"}
            />
            {isDCA && (
              <StatCard
                label="Contributions"
                value={`${(result as DCAResult).contributions}`}
              />
            )}
          </div>

          {/* Chart */}
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
              {isDCA
                ? "Portfolio Value vs. Contributions"
                : "Portfolio Value Over Time"}
            </h3>

            <ResponsiveContainer width="100%" height={350}>
              {isDCA ? (
                <LineChart data={result.chartData as Record<string, unknown>[]}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => {
                      const date = new Date(d + "T00:00:00");
                      return date.toLocaleDateString("en-CA", {
                        month: "short",
                        year: "2-digit",
                      });
                    }}
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-text-muted)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis
                    tickFormatter={formatCompact}
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-text-muted)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-chart-line)"
                    strokeWidth={2}
                    dot={false}
                    name="Portfolio"
                  />
                  <Line
                    type="stepAfter"
                    dataKey="contributed"
                    stroke="#9ca3af"
                    strokeWidth={1.5}
                    strokeDasharray="6 3"
                    dot={false}
                    name="Contributed"
                  />
                </LineChart>
              ) : (
                <AreaChart data={result.chartData as Record<string, unknown>[]}>
                  <defs>
                    <linearGradient
                      id="investGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={
                          isPositive
                            ? "var(--color-positive)"
                            : "var(--color-negative)"
                        }
                        stopOpacity={0.12}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          isPositive
                            ? "var(--color-positive)"
                            : "var(--color-negative)"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => {
                      const date = new Date(d + "T00:00:00");
                      return date.toLocaleDateString("en-CA", {
                        month: "short",
                        year: "2-digit",
                      });
                    }}
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-text-muted)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis
                    tickFormatter={formatCompact}
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-text-muted)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine
                    y={amount}
                    stroke="#9ca3af"
                    strokeDasharray="6 3"
                    strokeWidth={1}
                    label={{
                      value: "Invested",
                      position: "right",
                      fill: "#9ca3af",
                      fontSize: 11,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={
                      isPositive
                        ? "var(--color-positive)"
                        : "var(--color-negative)"
                    }
                    strokeWidth={2}
                    fill="url(#investGradient)"
                    dot={false}
                    name="Portfolio"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>

            {/* Data freshness */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {history.source && history.fetchedAt && (
                <DataFreshness
                  source={history.source}
                  fetchedAt={history.fetchedAt}
                />
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            This calculator uses historical adjusted close prices and assumes
            dividends were reinvested. Past performance does not guarantee future
            results. Not financial advice.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────

function StatCard({
  label,
  value,
  positive,
  highlight,
  className,
}: {
  label: string;
  value: string;
  positive?: boolean;
  highlight?: boolean;
  className?: string;
}) {
  const colorClass =
    positive === undefined
      ? "text-[var(--color-text-primary)]"
      : positive
      ? "text-[var(--color-positive)]"
      : "text-[var(--color-negative)]";

  return (
    <div
      className={`rounded-lg border border-[var(--color-border)] bg-white p-3 ${className ?? ""}`}
    >
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p
        className={`font-bold tabular-nums ${
          highlight ? "text-xl sm:text-2xl" : "text-base"
        } ${colorClass}`}
      >
        {value}
      </p>
    </div>
  );
}
