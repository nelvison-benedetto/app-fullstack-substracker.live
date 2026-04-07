"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  CreditCard,
  BarChart3,
  Bell,
  Shield,
  ArrowRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import ToggleDarkMode from "@/shared/components/molecules/ToggleDarkMode";

const featureIcons = [CreditCard, BarChart3, Bell, Shield];

const exampleSubs = [   //simulates what a real dashboard would show
  { name: "Netflix",   price: "12.99", color: "bg-red-500",   initial: "N" },
  { name: "Spotify",   price: "9.99",  color: "bg-green-500", initial: "S" },
  { name: "Adobe CC",  price: "59.99", color: "bg-red-700",   initial: "A" },
  { name: "iCloud+",   price: "2.99",  color: "bg-blue-500",  initial: "i" },
];

const total = exampleSubs
  .reduce((acc, s) => acc + parseFloat(s.price), 0)  //acc is the accumulator
  .toFixed(2);
//loop through all subscriptions, convert "12.99" → number, sum them, format to "XX.XX"

export default function WelcomePageContent() {
  const t = useTranslations("welcome");
  const tn = useTranslations("nav");  //navbar text

  const features = [
    { icon: featureIcons[0], title: t("f1_title"), desc: t("f1_desc") },
    { icon: featureIcons[1], title: t("f2_title"), desc: t("f2_desc") },
    { icon: featureIcons[2], title: t("f3_title"), desc: t("f3_desc") },
    { icon: featureIcons[3], title: t("f4_title"), desc: t("f4_desc") },
  ];
  //each feature icon,title(translated),description

  const steps = [
    { step: t("s1_step"), title: t("s1_title"), desc: t("s1_desc") },
    { step: t("s2_step"), title: t("s2_title"), desc: t("s2_desc") },
    { step: t("s3_step"), title: t("s3_title"), desc: t("s3_desc") },
  ];
  //used later for onboarding section

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/*Header*/}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">SubsTracker</span>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 dark:bg-emerald-950/60 px-1.5 py-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest text-emerald-400"
                style={{ textShadow: "0 0 6px #34d399, 0 0 14px #34d399" }}
              >
                live
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ToggleDarkMode />
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              {tn("login")}
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
            >
              {tn("get_started")}
            </Link>
          </div>
        </div>
      </header>

      {/*Hero section*/}
      <section className="pt-36 pb-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3 h-3" />
              {t("badge")}
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            {t("hero_title")}
            <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              {t("hero_title_highlight")}
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
          >
            {t("hero_subtitle")}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              {t("cta_primary")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 px-7 py-3.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-300"
            >
              {t("cta_secondary")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/*Mock Dashboard Card*/}
      <section className="pb-20 px-4 sm:px-6">
        <motion.div
          className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.32 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            {t("mock_title")}
          </p>

          <div className="space-y-2.5">
            {exampleSubs.map((sub, i) => (
              <motion.div
                key={sub.name}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.4 + i * 0.07 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${sub.color} rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {sub.initial}
                  </div>
                  <span className="font-medium text-sm">{sub.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-sm">€{sub.price}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">{t("mock_period")}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t("mock_total")}</span>
            <div>
              <span className="text-xl font-bold">€{total}</span>
              <span className="text-gray-400 text-sm font-normal">{t("mock_period")}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/*Features*/}
      <section className="py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {t("features_title")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t("features_subtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-white dark:text-black" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/*How it works*/}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {t("how_title")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-12">{t("how_subtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/*CTA*/}
      <section className="py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t("cta_title")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">{t("cta_subtitle")}</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-base"
          >
            {t("cta_btn")}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-400 mt-5 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {t("cta_note")}
          </p>
        </motion.div>
      </section>

      {/*Footer*/}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">SubsTracker</span>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 dark:bg-emerald-950/60 px-1.5 py-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest text-emerald-400"
                style={{ textShadow: "0 0 6px #34d399, 0 0 14px #34d399" }}
              >
                live
              </span>
            </span>
          </div>
          <p className="text-xs text-gray-400">{t("footer_copy")}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/login" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {t("footer_login")}
            </Link>
            <Link href="/register" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {t("footer_register")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
