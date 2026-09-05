"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatMoney } from "@/lib/format";

const PALETTE = ["#6d5ef7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"];

export function TrendChart({ data }: { data: { label: string; income: number; expense: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v) => `${Math.round(v / 1000000)}tr`}
        />
        <Tooltip
          formatter={(value) => formatMoney(Number(value) || 0)}
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="Thu nhập" fill="var(--success)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" name="Chi tiêu" fill="var(--danger)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }: { data: { name: string; amount: number }[] }) {
  const top = data.filter((d) => d.amount > 0).slice(0, 8);
  if (top.length === 0) {
    return <EmptyChart />;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={top} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
          {top.map((entry, i) => (
            <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatMoney(Number(value) || 0)}
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} layout="horizontal" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarChart({
  data,
  colorKey,
}: {
  data: { name: string; amount: number; color?: string }[];
  colorKey?: boolean;
}) {
  const filtered = data.filter((d) => d.amount > 0);
  if (filtered.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, filtered.length * 42)}>
      <BarChart data={filtered} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000000)}tr`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={110} />
        <Tooltip
          formatter={(value) => formatMoney(Number(value) || 0)}
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 13 }}
        />
        <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
          {filtered.map((entry, i) => (
            <Cell key={entry.name} fill={colorKey && entry.color ? entry.color : PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return <div className="flex h-40 items-center justify-center text-sm text-muted">Chưa có dữ liệu</div>;
}
