"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/shared/components/atoms/Button";
import Input from "@/shared/components/atoms/Input";
import Label from "@/shared/components/atoms/Label";
import {
  registerSchema,
  type RegisterSchema,
} from "@/features/auth/validation/auth.validation";
import { registerAction } from "@/shared/actions/auth.actions";
import { ROUTES } from "@/config";

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterSchema>();

  const onSubmit = async (data: RegisterSchema) => {
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterSchema;
        setError(field, { message: issue.message });
      });
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const res = await registerAction(data.email, data.password);
      if (!res.success) {
        setServerError(res.error ?? "Registration failed");
        return;
      }
      router.push(ROUTES.login + "?registered=true");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("password")}
            className={errors.password ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
        <li>At least 8 characters</li>
        <li>One uppercase letter</li>
        <li>One number</li>
        <li>One special character (!@#$%…)</li>
      </ul>

      <Button
        type="submit"
        variant="default"
        size="base"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-medium underline hover:text-black dark:hover:text-white"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
