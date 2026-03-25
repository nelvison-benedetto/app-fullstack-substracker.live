"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/shared/components/atoms/Button";
import Input from "@/shared/components/atoms/Input";
import Label from "@/shared/components/atoms/Label";
import {
  loginSchema,
  type LoginSchema,
} from "@/features/auth/validation/auth.validation";
import { loginAction } from "@/shared/actions/auth.actions";
import { ROUTES } from "@/config";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginSchema>();

  const onSubmit = async (data: LoginSchema) => {
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginSchema;
        setError(field, { message: issue.message });
      });
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const res = await loginAction(data.email, data.password);
      if (!res.success) {
        setServerError(res.error ?? t("login_failed"));
        return;
      }
      router.push(ROUTES.dashboard);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      variants={container}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {serverError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          {serverError}
        </motion.div>
      )}

      <motion.div variants={item} className="space-y-1.5">
        <Label htmlFor="email">{t("email_label")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("email_placeholder")}
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </motion.div>

      <motion.div variants={item} className="space-y-1.5">
        <Label htmlFor="password">{t("password_label")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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
      </motion.div>

      <motion.div variants={item}>
        <Button
          type="submit"
          variant="default"
          size="base"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? t("signing_in_btn") : t("sign_in_btn")}
        </Button>
      </motion.div>

      <motion.p variants={item} className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t("no_account")}{" "}
        <Link
          href={ROUTES.register}
          className="font-medium underline hover:text-black dark:hover:text-white"
        >
          {t("register_link")}
        </Link>
      </motion.p>
    </motion.form>
  );
}
