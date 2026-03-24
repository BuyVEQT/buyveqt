"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";

interface MiniChartProps {
  data: { date: string; close: number }[];
  positive: boolean;
}

export default function MiniChart({ data, positive }: MiniChartProps) {
  if (data.length < 2) return null;

  const prices = data.map((d) => d.close);
  const min = Math.floor(Math.min(...prices) * 0.995);
  const max = Math.ceil(Math.max(...prices) * 1.005);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={
                positive ? "var(--color-positive)" : "var(--color-negative)"
              }
              stopOpacity={0.15}
            />
            <stop
              offset="95%"
              stopColor={
                positive ? "var(--color-positive)" : "var(--color-negative)"
              }
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={(d) => {
            const date = new Date(d + "T00:00:00");
            return date.toLocaleDateString("en-CA", { month: "short" });
          }}
          tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={60}
        />
        <YAxis
          domain={[min, max]}
          tickFormatter={(v: number) => `$${v}`}
          tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
          width={42}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke={
            positive ? "var(--color-positive)" : "var(--color-negative)"
          }
          strokeWidth={1.5}
          fill="url(#miniGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
