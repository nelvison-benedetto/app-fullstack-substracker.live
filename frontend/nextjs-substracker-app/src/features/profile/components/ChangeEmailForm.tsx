"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/shared/components/atoms/Button";
import Input from "@/shared/components/atoms/Input";
import Label from "@/shared/components/atoms/Label";
import { updateProfileAction } from "@/shared/actions/user.actions";

const schema = z.object({
  newEmail: z.string().min(1, "Email is required").email("Invalid email address"),
});
type Schema = z.infer<typeof schema>;

type Props = {
  currentEmail: string;
  onUpdated?: (newEmail: string) => void;
};

export default function ChangeEmailForm({ currentEmail, onUpdated }: Props) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Schema>({ defaultValues: { newEmail: currentEmail } });

  const onSubmit = async (data: Schema) => {
    if (data.newEmail === currentEmail) return;

    setIsLoading(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await updateProfileAction({ newEmail: data.newEmail });
      if (!res.success) {
        setServerError(res.error ?? "Failed to update email");
        return;
      }
      setSuccess(true);
      onUpdated?.(data.newEmail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="text-sm font-semibold mb-1">Change email</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Update the email address associated with your account.
      </p>

      {success && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Email updated successfully.
        </div>
      )}

      {serverError && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="newEmail">Email address</Label>
          <Input
            id="newEmail"
            type="email"
            autoComplete="email"
            {...register("newEmail")}
            className={errors.newEmail ? "border-red-500" : ""}
          />
          {errors.newEmail && (
            <p className="text-xs text-red-500">{errors.newEmail.message}</p>
          )}
        </div>

        <Button type="submit" variant="default" size="sm" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save email"}
        </Button>
      </form>
    </div>
  );
}
