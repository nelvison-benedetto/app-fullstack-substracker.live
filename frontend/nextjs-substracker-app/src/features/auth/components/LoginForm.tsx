"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";     //manages form state efficiently (no re-renders per keystroke)
import { useTranslations } from "next-intl";   //gives you t("mykey") -> translated strings

//i18n, custom router and link that respects /en, /it, etc.
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";

import { Eye, EyeOff } from "lucide-react";   //icons x show/hide password
import Button from "@/shared/components/atoms/Button";
import Input from "@/shared/components/atoms/Input";
import Label from "@/shared/components/atoms/Label";
import {
  loginSchema,        //zod validation rules
  type LoginSchema,   //inferred TypeScript type
} from "@/features/auth/validation/auth.validation";
import { loginAction } from "@/shared/actions/auth.actions";    //calls backend login
import { ROUTES } from "@/config";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
//parent animation: children animate one after another, staggerChildren = delay between items.

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};
//each element animation: fades in, moves up slightly

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,       //connects input to form
    handleSubmit,   //wraps submit handler
    setError,       //manually set validation errors
    formState: { errors },    //errors -> contains validation errors
  } = useForm<LoginSchema>();

  const onSubmit = async (data: LoginSchema) => {
    const result = loginSchema.safeParse(data);   //zod validation, validates input safely (no throw)
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginSchema;
        setError(field, { message: issue.message });
      });
      //loop through validation errors, assign each error to the correct field.
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
      router.push(ROUTES.dashboard);    //redirect to dashboard
      router.refresh();                 //re-fetch server data (important for auth)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      variants={container}              //parent animation, la hai definita sopra, con anche gia hidden e visible pre-settati.
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit(onSubmit)} //wraps your function
      className="space-y-5"
      noValidate                        //disables browser validation (you use Zod instead)
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

      <motion.div variants={item} className="space-y-1.5">  {/*sopra sopra hai gia definito sia 'item' che 'container', quindi item è in relazione al parent <motion.form initial="hidden" animate="visible">, when parent is "hidden" -> child uses item.hidden, When parent is "visible" -> child uses item.visible. use 'variants' much better x logic centralized instead of writing initial={{ opacity: 0 }} animate={{ opacity: 1 }}*/}
        <Label htmlFor="email">{t("email_label")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"    //tells browser This field is for email -> suggest autofill values. better UX experience!!
          placeholder={t("email_placeholder")}
          {...register("email")}    //React Hook Form tracks the fields, capture value changes, handles validation, stores state efficiently
          /*
          React Hook Form do
          <Input
            name="email"
            onChange={...}
            onBlur={...}
            ref={...}
          />
          */
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
            onClick={() => setShowPassword((v) => !v)}  //toggles psw visibility
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            tabIndex={-1}   //user presses TAB -> skips this element. when u press TAB the browser moves focus on the next focusable element (e.g.input / button / link/ ect).
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
