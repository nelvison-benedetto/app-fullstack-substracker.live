"use client";

import { motion } from "motion/react";

type StatCard = { label: string; value: string };

export default function StatsGrid({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
