"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatBrl } from "@/lib/utils";
import { CHART_CHANNEL_COLORS, CHART_CHANNELS } from "@/lib/acquisition-stats";
import { CHANNEL_LABELS } from "@/lib/acquisition";

interface AcquisitionChartProps {
  data: Record<string, string | number>[];
}

export function AcquisitionChart({ data }: AcquisitionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
        <Tooltip formatter={(value) => formatBrl(Number(value))} />
        <Legend
          formatter={(value) => CHANNEL_LABELS[value as keyof typeof CHANNEL_LABELS] ?? value}
        />
        {CHART_CHANNELS.map((channel) => (
          <Bar
            key={channel}
            dataKey={channel}
            stackId="revenue"
            fill={CHART_CHANNEL_COLORS[channel]}
            name={channel}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
