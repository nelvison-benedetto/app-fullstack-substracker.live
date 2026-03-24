"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import Button from "@/shared/components/atoms/Button";
import Input from "@/shared/components/atoms/Input";
import Label from "@/shared/components/atoms/Label";
import {
  subscriptionSchema,
  type SubscriptionSchema,
  BILLING_CYCLES,
  CATEGORIES,
} from "@/features/subscriptions/validation/subscription.validation";
import type { Subscription } from "@/shared/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: SubscriptionSchema) => Promise<void>;
  initial?: Subscription | null;
  isLoading?: boolean;
};

export default function SubscriptionFormModal({
  open,
  onClose,
  onSave,
  initial,
  isLoading = false,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriptionSchema>();

  useEffect(() => {
    if (open) {
      setServerError(null);
      if (initial) {
        reset({
          name: initial.name,
          amount: initial.amount,
          billingCycle: initial.billingCycle,
          startDate: initial.startDate,
          endDate: initial.endDate ?? "",
          category: initial.category ?? "",
        });
      } else {
        reset({
          name: "",
          amount: undefined,
          billingCycle: "Mensile",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          category: "",
        });
      }
    }
  }, [open, initial, reset]);

  const onSubmit = async (data: SubscriptionSchema) => {
    const result = subscriptionSchema.safeParse(data);
    if (!result.success) return;

    setServerError(null);
    try {
      await onSave({
        ...data,
        endDate: data.endDate || null,
        category: data.category || null,
      });
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

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
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">
                {isEdit ? "Edit subscription" : "Add subscription"}
              </h2>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </motion.button>
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
              >
                {serverError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Netflix"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="9.99"
                    {...register("amount", { valueAsNumber: true })}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="billingCycle">Billing cycle</Label>
                  <select
                    id="billingCycle"
                    {...register("billingCycle")}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  >
                    {BILLING_CYCLES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate">Start date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endDate">End date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category (optional)</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">— None —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving…" : isEdit ? "Save changes" : "Add subscription"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
