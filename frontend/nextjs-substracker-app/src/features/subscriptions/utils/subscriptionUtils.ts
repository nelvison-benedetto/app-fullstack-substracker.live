import type { Subscription } from "@/shared/types";

export function toMonthly(amount: number, billingCycle: string): number {
  switch (billingCycle) {
    case "Mensile":     return amount;
    case "Annuale":     return amount / 12;
    case "Settimanale": return amount * 4.33;
    case "Trimestrale": return amount / 3;
    case "Semestrale":  return amount / 6;
    default:            return amount;
  }
}
//converts ANY subscription into a monthly equivalent value

export const CATEGORY_COLORS: Record<string, string> = {
  Streaming:    "#8b5cf6",
  Musica:       "#ec4899",
  Gaming:       "#3b82f6",
  Produttività: "#10b981",
  Notizie:      "#f59e0b",
  Cloud:        "#0ea5e9",
  Fitness:      "#f97316",
  Educazione:   "#14b8a6",
  Altro:        "#6b7280",
};
//maps categories → colors

export const CHART_PALETTE = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#f43f5e",
  "#14b8a6",
];
//palette for charts

export function buildTrendData(subscriptions: Subscription[]) {     //AREA CHART
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {   //last 12 months
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);    //builds each month
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);      //
    const lastDay  = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    //define month boundaries

    const amount = subscriptions.reduce((acc, sub) => {       //calculate monthly spending
      const start = new Date(sub.startDate);
      const end   = sub.endDate ? new Date(sub.endDate) : null;
      if (start <= lastDay && (!end || end >= firstDay)) {    //subscription was active during that month
        return acc + toMonthly(sub.amount, sub.billingCycle);   //add value
      }
      return acc;
    }, 0);

    return {
      month:  d.toLocaleDateString("it-IT", { month: "short", year: "2-digit" }),
      amount: parseFloat(amount.toFixed(2)),
    };
  });
}
//creates 12-month spending history
export function buildCategoryData(subscriptions: Subscription[]) {      //PIE CHART
  const map = new Map<string, number>();    //group by category
  for (const sub of subscriptions) {
    const cat = sub.category || "Altro";
    map.set(cat, (map.get(cat) ?? 0) + toMonthly(sub.amount, sub.billingCycle));    //sums spending per category
  }
  return Array.from(map.entries())    //convert to array
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);   //biggest categories first
}

export function buildBillingCycleData(subscriptions: Subscription[]) {
  const map = new Map<string, { count: number; monthly: number }>();    //group by billing cycle
  for (const sub of subscriptions) {
    const cur = map.get(sub.billingCycle) ?? { count: 0, monthly: 0 };
    map.set(sub.billingCycle, {
      count:   cur.count + 1,
      monthly: cur.monthly + toMonthly(sub.amount, sub.billingCycle),
    });
  }
  return Array.from(map.entries()).map(([cycle, s]) => ({
    cycle,
    count:   s.count,
    monthly: parseFloat(s.monthly.toFixed(2)),
  }));
}

export function buildTopData(subscriptions: Subscription[], limit = 8) {    //RANKING LIST
  return subscriptions
    .map((sub) => ({
      name:    sub.name.length > 20 ? sub.name.slice(0, 20) + "…" : sub.name,   //truncate long names
      monthly: parseFloat(toMonthly(sub.amount, sub.billingCycle).toFixed(2)),
    }))
    .sort((a, b) => b.monthly - a.monthly)    //highest cost first
    .slice(0, limit);   //limit result
}
