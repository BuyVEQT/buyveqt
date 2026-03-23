"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { VEQT_DISTRIBUTIONS } from "@/data/distributions";

const chartData = [...VEQT_DISTRIBUTIONS.distributions]
  .reverse()
  .map((d) => ({
    date: d.exDate,
    amount: d.amount,
    label: new Date(d.exDate).toLocaleDateString("en-CA", {
      month: "short",
      year: "2-digit",
    }),
  }));

interface TooltipPayloadItem {
  value: number;
  payload: { date: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const date = new Date(payload[0].payload.date);
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] text-[var(--color-text-muted)]">
        {date.toLocaleDateString("en-CA", { year: "numeric", month: "long" })}
      </p>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        ${payload[0].value.toFixed(4)} per unit
      </p>
    </div>
  );
}

export default function DistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
          interval={1}
        />
        <YAxis
          tickFormatter={(v: number) => `$${v.toFixed(2)}`}
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-base)" }} />
        <Bar dataKey="amount" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
