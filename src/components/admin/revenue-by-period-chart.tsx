"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatBrl } from "@/lib/utils";

interface RevenueByPeriodChartProps {
  data: { label: string; revenue: number; orders: number }[];
}

export function RevenueByPeriodChart({ data }: RevenueByPeriodChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
        <Tooltip
          formatter={(value) => [formatBrl(Number(value)), "Receita"]}
          labelFormatter={(label, payload) => {
            const orders = payload?.[0]?.payload?.orders ?? 0;
            return `${label} · ${orders} pedido${orders === 1 ? "" : "s"}`;
          }}
        />
        <Bar dataKey="revenue" fill="#0EA5E9" radius={[4, 4, 0, 0]} name="revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
}
