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

export function buildTrendData(subscriptions: Subscription[]) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const lastDay  = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const amount = subscriptions.reduce((acc, sub) => {
      const start = new Date(sub.startDate);
      const end   = sub.endDate ? new Date(sub.endDate) : null;
      if (start <= lastDay && (!end || end >= firstDay)) {
        return acc + toMonthly(sub.amount, sub.billingCycle);
      }
      return acc;
    }, 0);

    return {
      month:  d.toLocaleDateString("it-IT", { month: "short", year: "2-digit" }),
      amount: parseFloat(amount.toFixed(2)),
    };
  });
}

export function buildCategoryData(subscriptions: Subscription[]) {
  const map = new Map<string, number>();
  for (const sub of subscriptions) {
    const cat = sub.category || "Altro";
    map.set(cat, (map.get(cat) ?? 0) + toMonthly(sub.amount, sub.billingCycle));
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
}

export function buildBillingCycleData(subscriptions: Subscription[]) {
  const map = new Map<string, { count: number; monthly: number }>();
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

export function buildTopData(subscriptions: Subscription[], limit = 8) {
  return subscriptions
    .map((sub) => ({
      name:    sub.name.length > 20 ? sub.name.slice(0, 20) + "…" : sub.name,
      monthly: parseFloat(toMonthly(sub.amount, sub.billingCycle).toFixed(2)),
    }))
    .sort((a, b) => b.monthly - a.monthly)
    .slice(0, limit);
}
