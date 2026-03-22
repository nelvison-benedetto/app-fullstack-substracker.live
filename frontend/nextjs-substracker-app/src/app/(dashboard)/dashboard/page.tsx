import type { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/config";
import type { AuthUser, Subscription } from "@/shared/types";
import { getSubscriptionsAction } from "@/shared/actions/subscription.actions";
import SubscriptionList from "@/features/subscriptions/components/SubscriptionList";

export const metadata: Metadata = {
  title: "Dashboard – SubsTracker",
};

function computeStats(subs: Subscription[]) {
  const monthly = subs.reduce((acc, s) => {
    switch (s.billingCycle) {
      case "Mensile":     return acc + s.amount;
      case "Annuale":     return acc + s.amount / 12;
      case "Settimanale": return acc + s.amount * 4.33;
      case "Trimestrale": return acc + s.amount / 3;
      case "Semestrale":  return acc + s.amount / 6;
      default:            return acc + s.amount;
    }
  }, 0);

  return {
    count: subs.length,
    monthly,
    annual: monthly * 12,
  };
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  let user: AuthUser | null = null;
  const userInfoCookie = cookieStore.get(COOKIE_NAMES.userInfo)?.value;
  if (userInfoCookie) {
    try {
      user = JSON.parse(userInfoCookie) as AuthUser;
    } catch {
      user = null;
    }
  }

  const result = await getSubscriptionsAction();
  const subscriptions: Subscription[] = result.success ? (result.data ?? []) : [];
  const stats = computeStats(subscriptions);

  const fmt = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  const statCards = [
    { label: "Active Subscriptions", value: stats.count.toString() },
    { label: "Monthly Spend", value: fmt(stats.monthly) },
    { label: "Annual Spend", value: fmt(stats.annual) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back{user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Subscription list — client component per CRUD interattivo */}
      <SubscriptionList initialSubscriptions={subscriptions} />
    </div>
  );
}
