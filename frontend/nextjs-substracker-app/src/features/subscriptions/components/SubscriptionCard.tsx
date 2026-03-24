"use client";

import { motion } from "motion/react";
import { Pencil, Trash2 } from "lucide-react";
import type { Subscription } from "@/shared/types";

type Props = {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (sub: Subscription) => void;
};

const cycleLabel: Record<string, string> = {
  Mensile: "/mo",
  Annuale: "/yr",
  Settimanale: "/wk",
  Trimestrale: "/3mo",
  Semestrale: "/6mo",
};

const categoryColors: Record<string, string> = {
  Streaming: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Musica: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Gaming: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Produttività: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Notizie: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Cloud: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  Fitness: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Educazione: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

export default function SubscriptionCard({ subscription: sub, onEdit, onDelete }: Props) {
  const suffix = cycleLabel[sub.billingCycle] ?? `/${sub.billingCycle}`;
  const categoryClass =
    sub.category && categoryColors[sub.category]
      ? categoryColors[sub.category]
      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors group"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar lettera */}
        <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
          {sub.name.slice(0, 1).toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{sub.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {sub.category && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${categoryClass}`}>
                {sub.category}
              </span>
            )}
            <span className="text-xs text-gray-400">{sub.billingCycle}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        <span className="text-sm font-semibold tabular-nums">
          €{Number(sub.amount).toFixed(2)}
          <span className="text-xs font-normal text-gray-400">{suffix}</span>
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(sub)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Edit"
          >
            <Pencil size={14} />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(sub)}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
