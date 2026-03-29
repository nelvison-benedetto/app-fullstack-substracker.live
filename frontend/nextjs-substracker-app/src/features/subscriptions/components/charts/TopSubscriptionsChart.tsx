"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { Subscription } from "@/shared/types";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { buildTopData, CHART_PALETTE } from "@/features/subscriptions/utils/subscriptionUtils";

type Props = {
  subscriptions: Subscription[];
  title: string;
  subtitle: string;
  noData: string;
};

export default function TopSubscriptionsChart({
  subscriptions,
  title,
  subtitle,
  noData,
}: Props) {
  const { theme } = useDarkMode();
  const isDark = theme === "dark";
  const data = buildTopData(subscriptions, 8);

  const textColor   = isDark ? "#9ca3af" : "#6b7280";
  const gridColor   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
  const labelColor  = isDark ? "#e5e7eb" : "#374151";
  const tooltipBg   = isDark ? "#111827" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const tooltipText   = isDark ? "#f9fafb" : "#111827";

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col min-h-[200px]">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
          {noData}
        </div>
      </div>
    );
  }

  const chartHeight = Math.max(data.length * 44, 200);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 mb-5">{subtitle}</p>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            horizontal={false}
            vertical={true}
          />
          <XAxis
            type="number"
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `€${v}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              fontSize: 13,
              color: tooltipText,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [`€${Number(value ?? 0).toFixed(2)}/mo`, "Spesa mensile"]}
          />
          <Bar dataKey="monthly" radius={[0, 4, 4, 0]} maxBarSize={30}>
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={CHART_PALETTE[index % CHART_PALETTE.length]}
              />
            ))}
            <LabelList
              dataKey="monthly"
              position="right"
              formatter={(v) => `€${Number(v ?? 0).toFixed(2)}`}
              style={{ fill: labelColor, fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
