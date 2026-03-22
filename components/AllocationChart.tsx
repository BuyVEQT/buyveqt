"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ASSET_ALLOCATION } from "@/lib/constants";

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: { color: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full mr-2"
          style={{ backgroundColor: item.payload.color }}
        />
        {item.name}: {item.value}%
      </p>
    </div>
  );
}

export default function AllocationChart() {
  return (
    <section className="bg-[var(--color-surface-alt)]">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          Asset Allocation
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          <div className="w-[280px] h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ASSET_ALLOCATION}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {ASSET_ALLOCATION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-4">
            {ASSET_ALLOCATION.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[var(--color-text-secondary)] text-base min-w-[150px]">
                  {item.name}
                </span>
                <span className="text-[var(--color-text-primary)] font-semibold text-lg tabular-nums">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
