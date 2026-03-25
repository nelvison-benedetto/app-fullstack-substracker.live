import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, getLocale } from "next-intl/server";
import { COOKIE_NAMES } from "@/config";
import type { AuthUser, Subscription } from "@/shared/types";
import { getSubscriptionsAction } from "@/shared/actions/subscription.actions";
import SubscriptionList from "@/features/subscriptions/components/SubscriptionList";
import StatsGrid from "@/shared/components/molecules/StatsGrid";
import AnimatedSection from "@/shared/components/molecules/AnimatedSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: `${t("title")} – SubSnap` };
}

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

  return { count: subs.length, monthly, annual: monthly * 12 };
}

export default async function DashboardPage() {
  const [cookieStore, t, locale] = await Promise.all([
    cookies(),
    getTranslations("dashboard"),
    getLocale(),
  ]);

  let user: AuthUser | null = null;
  const userInfoCookie = cookieStore.get(COOKIE_NAMES.userInfo)?.value;
  if (userInfoCookie) {
    try { user = JSON.parse(userInfoCookie) as AuthUser; } catch { /* */ }
  }

  const result = await getSubscriptionsAction();
  const subscriptions: Subscription[] = result.success ? (result.data ?? []) : [];
  const stats = computeStats(subscriptions);

  const numberLocale = locale === "it" ? "it-IT" : "en-US";
  const fmt = (n: number) =>
    new Intl.NumberFormat(numberLocale, { style: "currency", currency: "EUR" }).format(n);

  const statCards = [
    { label: t("stat_count"),   value: stats.count.toString() },
    { label: t("stat_monthly"), value: fmt(stats.monthly) },
    { label: t("stat_annual"),  value: fmt(stats.annual) },
  ];

  const emailSuffix = user?.email ? `, ${user.email}` : "";
  const welcomeMsg = t("welcome").replace("{email}", emailSuffix);

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{welcomeMsg}</p>
      </AnimatedSection>

      <StatsGrid cards={statCards} />

      <SubscriptionList initialSubscriptions={subscriptions} />
    </div>
  );
}
