"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatBrl } from "@/lib/utils";

interface SalesChartProps {
  data: { date: string; revenue: number; orders: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
        <Tooltip
          formatter={(value, name) => {
            if (name === "revenue") return [formatBrl(Number(value)), "Receita"];
            return [value, "Pedidos"];
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#0EA5E9"
          strokeWidth={2}
          dot={false}
          name="revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
