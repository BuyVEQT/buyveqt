"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { VEQT_SECTOR_ALLOCATION } from "@/data/holdings";

const SECTOR_COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6",
];

interface TooltipPayloadItem {
  value: number;
  payload: { sector: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">
        {payload[0].payload.sector}: {payload[0].value}%
      </p>
    </div>
  );
}

export default function SectorChart() {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        data={VEQT_SECTOR_ALLOCATION}
        layout="vertical"
        margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
      >
        <XAxis
          type="number"
          domain={[0, 30]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="sector"
          width={140}
          tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-base)" }} />
        <Bar dataKey="weight" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {VEQT_SECTOR_ALLOCATION.map((_, i) => (
            <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
