"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { Subscription } from "@/shared/types";
import SpendingTrendChart    from "./charts/SpendingTrendChart";
import CategoryBreakdownChart from "./charts/CategoryBreakdownChart";
import BillingCycleChart     from "./charts/BillingCycleChart";
import TopSubscriptionsChart  from "./charts/TopSubscriptionsChart";

type Props = {
  subscriptions: Subscription[];
};

export default function ChartsSection({ subscriptions }: Props) {
  const t = useTranslations("charts");

  if (subscriptions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
      className="space-y-4"
    >
      <h2 className="text-base font-semibold">{t("title")}</h2>

      {/* Andamento mensile — full width */}
      <SpendingTrendChart
        subscriptions={subscriptions}
        title={t("trend_title")}
        subtitle={t("trend_subtitle")}
      />

      {/* Categoria + Ciclo di fatturazione — 2 colonne */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryBreakdownChart
          subscriptions={subscriptions}
          title={t("category_title")}
          subtitle={t("category_subtitle")}
          noData={t("no_data")}
        />
        <BillingCycleChart
          subscriptions={subscriptions}
          title={t("billing_title")}
          subtitle={t("billing_subtitle")}
          noData={t("no_data")}
        />
      </div>

      {/* Top subscriptions — full width */}
      <TopSubscriptionsChart
        subscriptions={subscriptions}
        title={t("top_title")}
        subtitle={t("top_subtitle")}
        noData={t("no_data")}
      />
    </motion.div>
  );
}
