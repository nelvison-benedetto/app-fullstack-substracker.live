"use client";

import {
  BarChart,               //main chart container
  Bar,                    //the bars (data visualization)
  XAxis,                  //x axis
  YAxis,                  //y axis
  CartesianGrid,          //grid lines
  Tooltip,                //hover popup
  ResponsiveContainer,    //makes chart responsive
  Cell,                   //customize each bar individually
} from "recharts";
import type { Subscription } from "@/shared/types";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { buildBillingCycleData } from "@/features/subscriptions/utils/subscriptionUtils";

const CYCLE_COLORS: Record<string, string> = {
  Mensile:      "#6366f1",
  Annuale:      "#8b5cf6",
  Settimanale:  "#f59e0b",
  Trimestrale:  "#10b981",
  Semestrale:   "#3b82f6",
};
//each billing cycle has a different color

type Props = {
  subscriptions: Subscription[];
  title: string;
  subtitle: string;
  noData: string;
};

export default function BillingCycleChart({
  subscriptions,
  title,
  subtitle,
  noData,
}: Props) {

  const { theme } = useDarkMode();
  const isDark = theme === "dark";
  const data = buildBillingCycleData(subscriptions);

  const textColor   = isDark ? "#9ca3af" : "#6b7280";
  const gridColor   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
  const tooltipBg   = isDark ? "#111827" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const tooltipText   = isDark ? "#f9fafb" : "#111827";

  if (data.length === 0) {      //if there are no data
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col min-h-[280px]">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
          {noData}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 mb-5">{subtitle}</p>

      <ResponsiveContainer width="100%" height={220}>     {/*necessary to resize chart properly*/}
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>    {/*main chart wrapper*/}
          <CartesianGrid            //grid lines
            strokeDasharray="3 3"   //dashed lines
            stroke={gridColor}
            horizontal={true}       //only horizontal
            vertical={false}
          />
          <XAxis
            dataKey="cycle"         //uses 'cycles' from your data
            tick={{ fill: textColor, fontSize: 11 }}    //no tick line, minimal UI
            axisLine={false}
            tickLine={false}
            dy={8}                  //moves labels down
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 11 }}    //no tick line, minimal UI
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `€${v}`}      //converts number into 50 -> €50
            width={56}
          />
          <Tooltip      //hover behavior
            contentStyle={{       //custom styled tooltip
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              fontSize: 13,
              color: tooltipText,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value, name) =>
              name === "monthly"
                ? [`€${Number(value ?? 0).toFixed(2)}/mo`, "Spesa mensile norm."]
                : [`${value ?? 0}`, "Subscriptions"]
            }  //if hovering a bar: value=50, name='monthly'. output is €50/mo  Spesa mensile norm.
          />
          <Bar dataKey="monthly" radius={[4, 4, 0, 0]} maxBarSize={52}>     {/*dataKey="monthly" → which field to use, radius=[4,4,0,0] → rounded top corners, maxBarSize=52 → limits width*/}
            {data.map((entry) => (      //each bar gets a different color based on its cycle
              <Cell
                key={entry.cycle}
                fill={CYCLE_COLORS[entry.cycle] ?? "#6366f1"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
