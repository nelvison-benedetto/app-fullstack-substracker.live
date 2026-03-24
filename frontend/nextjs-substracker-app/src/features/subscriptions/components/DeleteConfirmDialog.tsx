"use client";

import { AnimatePresence, motion } from "motion/react";

type Props = {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function DeleteConfirmDialog({
  open,
  name,
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl"
          >
            <h2 className="text-base font-semibold mb-2">Delete subscription</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">{name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 rounded-md bg-red-500 text-white px-4 py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Deleting…" : "Delete"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
