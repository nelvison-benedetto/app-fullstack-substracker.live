import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, getLocale } from "next-intl/server";
import { COOKIE_NAMES } from "@/config";
import type { AuthUser, Subscription } from "@/shared/types";
import { getSubscriptionsAction } from "@/shared/actions/subscription.actions";
import SubscriptionList from "@/features/subscriptions/components/SubscriptionList";
import ChartsSection from "@/features/subscriptions/components/ChartsSection";
import StatsGrid from "@/shared/components/molecules/StatsGrid";
import AnimatedSection from "@/shared/components/molecules/AnimatedSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: `${t("title")} – SubSnap` };
}
//load translations, sets page title dinamically

function computeStats(subs: Subscription[]) {
  const monthly = subs.reduce((acc, s) => {       //loop through all subscriptions.
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
//this funct calculates total subscriptions, monthly costs, annul costs

export default async function DashboardPage() {

  const [cookieStore, t, locale] = await Promise.all([
    cookies(),
    getTranslations("dashboard"),
    getLocale(),
  ]);
  //parallel data fetching

  let user: AuthUser | null = null;
  const userInfoCookie = cookieStore.get(COOKIE_NAMES.userInfo)?.value;
  if (userInfoCookie) {
    try { user = JSON.parse(userInfoCookie) as AuthUser; } catch { /* */ }
  }

  const result = await getSubscriptionsAction();      //fetch subscriptions
  const subscriptions: Subscription[] = result.success ? (result.data ?? []) : [];
  const fetchError: string | null = result.success ? null : (result.error ?? "Failed to load subscriptions");
  const stats = computeStats(subscriptions);    //uses the function from above

  const numberLocale = locale === "it" ? "it-IT" : "en-US";     //format currency
  const fmt = (n: number) =>
    new Intl.NumberFormat(numberLocale, { style: "currency", currency: "EUR" }).format(n);
  //formatter, e.g. it-IT -> €10,50 , en-EN -> $10.50

  const statCards = [
    { label: t("stat_count"),   value: stats.count.toString() },
    { label: t("stat_monthly"), value: fmt(stats.monthly) },
    { label: t("stat_annual"),  value: fmt(stats.annual) },
  ];

  const emailSuffix = user?.email ? `, ${user.email}` : "";
  const welcomeMsg = t("welcome").replace("{email}", emailSuffix);
  //welcome message

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{welcomeMsg}</p>
      </AnimatedSection>

      <StatsGrid cards={statCards} />

      {fetchError && (
        <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {fetchError}
        </div>
      )}

      <ChartsSection subscriptions={subscriptions} />

      <SubscriptionList initialSubscriptions={subscriptions} />
    </div>
  );
}
