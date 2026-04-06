"use client";

import {
  PieChart,               //main chart container
  Pie,                    //the circular chart
  Cell,                   //each slice (color customization)
  Tooltip,                //hover info
  Legend,                 //labels below
  ResponsiveContainer,    //makes chart responsive
} from "recharts";
import type { Subscription } from "@/shared/types";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import {
  buildCategoryData,
  CATEGORY_COLORS,
  CHART_PALETTE,
} from "@/features/subscriptions/utils/subscriptionUtils";

type Props = {
  subscriptions: Subscription[];
  title: string;
  subtitle: string;
  noData: string;
};

export default function CategoryBreakdownChart({
  subscriptions,
  title,
  subtitle,
  noData,
}: Props) {
  const { theme } = useDarkMode();
  const isDark = theme === "dark";
  const data = buildCategoryData(subscriptions);

  const textColor   = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg   = isDark ? "#111827" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const tooltipText   = isDark ? "#f9fafb" : "#111827";

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col min-h-[280px]">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
          {noData}
        </div>
      </div>
    );
  }

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 mb-1">{subtitle}</p>
      <p className="text-lg font-semibold tabular-nums mb-4">
        €{total.toFixed(2)}<span className="text-xs font-normal text-gray-400 ml-1">/mo</span>
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            //center of the chart
            innerRadius={58}
            outerRadius={88}
            //creates 'donut' shape
            paddingAngle={3}    //space between slices
            dataKey="value"     //each slice (color customization)
            strokeWidth={0}     //no outline -> modern look
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={CATEGORY_COLORS[entry.name] ?? CHART_PALETTE[index % CHART_PALETTE.length]}
              />
            ))}
          </Pie>

          <Tooltip    //hover bahvior
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              fontSize: 13,
              color: tooltipText,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value, name) => {
              const n = Number(value ?? 0);
              return [`€${n.toFixed(2)}/mo (${((n / total) * 100).toFixed(1)}%)`, String(name)];
            }}
          />

          <Legend     //x labels
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value: string) => (    //match dark/light mode
              <span style={{ color: textColor }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
