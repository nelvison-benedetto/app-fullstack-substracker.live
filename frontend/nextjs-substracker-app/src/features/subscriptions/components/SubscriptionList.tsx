"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import Button from "@/shared/components/atoms/Button";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionFormModal from "./SubscriptionFormModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import type { Subscription, CreateSubscriptionData, UpdateSubscriptionData } from "@/shared/types";
import {
  createSubscriptionAction,
  updateSubscriptionAction,
  deleteSubscriptionAction,
} from "@/shared/actions/subscription.actions";
import type { SubscriptionSchema } from "@/features/subscriptions/validation/subscription.validation";
import { useRouter } from "next/navigation";

type Props = {
  initialSubscriptions: Subscription[];
};

export default function SubscriptionList({ initialSubscriptions }: Props) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditTarget(null);
    setIsFormOpen(true);
  };

  const handleEdit = (sub: Subscription) => {
    setEditTarget(sub);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (sub: Subscription) => {
    setDeleteTarget(sub);
  };

  const handleSave = async (data: SubscriptionSchema) => {
    setError(null);
    setIsSaving(true);
    try {
      if (editTarget) {
        const payload: UpdateSubscriptionData = {
          name: data.name,
          amount: data.amount,
          billingCycle: data.billingCycle,
          endDate: data.endDate || null,
          category: data.category || null,
        };
        const res = await updateSubscriptionAction(editTarget.id, payload);
        if (!res.success) throw new Error(res.error);
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === editTarget.id ? (res.data as Subscription) : s))
        );
      } else {
        const payload: CreateSubscriptionData = {
          name: data.name,
          amount: data.amount,
          billingCycle: data.billingCycle,
          startDate: data.startDate,
          endDate: data.endDate || null,
          category: data.category || null,
        };
        const res = await createSubscriptionAction(payload);
        if (!res.success) throw new Error(res.error);
        setSubscriptions((prev) => [res.data as Subscription, ...prev]);
      }
      startTransition(() => router.refresh());
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setError(null);
    setIsDeleting(true);
    try {
      const res = await deleteSubscriptionAction(deleteTarget.id);
      if (!res.success) {
        setError(res.error ?? "Delete failed");
        return;
      }
      setSubscriptions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold">Your Subscriptions</h2>
          <Button variant="default" size="sm" onClick={handleAdd} className="flex items-center gap-1.5">
            <Plus size={14} />
            Add
          </Button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-6 mt-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {subscriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-6 py-12 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              No subscriptions yet.
            </p>
            <Button variant="outline" size="sm" onClick={handleAdd}>
              Add your first subscription
            </Button>
          </motion.div>
        ) : (
          <div className="p-4 flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <SubscriptionFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        initial={editTarget}
        isLoading={isSaving}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
