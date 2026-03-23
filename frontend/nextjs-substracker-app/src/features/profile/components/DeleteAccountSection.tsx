"use client";

import { useState } from "react";
import Button from "@/shared/components/atoms/Button";
import { deleteUserAction } from "@/shared/actions/user.actions";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config";

export default function DeleteAccountSection() {
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    const res = await deleteUserAction();
    if (!res.success) {
      setError(res.error ?? "Failed to delete account");
      setIsDeleting(false);
      return;
    }
    router.push(ROUTES.login);
  };

  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-gray-900 p-6">
      <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
        Delete account
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {!confirmed ? (
        <Button
          variant="danger"
          size="sm"
          onClick={() => setConfirmed(true)}
        >
          Delete account
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Yes, delete my account"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setConfirmed(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
