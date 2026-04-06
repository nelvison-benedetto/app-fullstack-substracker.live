"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Subscription } from "@/shared/types";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { buildTrendData } from "@/features/subscriptions/utils/subscriptionUtils";

type Props = {
  subscriptions: Subscription[];
  title: string;
  subtitle: string;
};

export default function SpendingTrendChart({ subscriptions, title, subtitle }: Props) {
  const { theme } = useDarkMode();
  const isDark = theme === "dark";
  const data = buildTrendData(subscriptions);

  const textColor  = isDark ? "#9ca3af" : "#6b7280";
  const gridColor  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
  const tooltipBg  = isDark ? "#111827" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const tooltipText   = isDark ? "#f9fafb" : "#111827";

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 mb-5">{subtitle}</p>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
            </linearGradient>
          </defs>   {/*this definites a custom gradient fill*/}

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

          <XAxis
            dataKey="month"
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `€${v}`}
            width={56}
          />

          <Tooltip    //hover behavior
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              fontSize: 13,
              color: tooltipText,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [`€${Number(value ?? 0).toFixed(2)}`, "Spesa mensile"]}
          />

          <Area
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#trendGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
