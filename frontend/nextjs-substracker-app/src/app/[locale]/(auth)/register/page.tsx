import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import RegisterForm from "@/features/auth/components/RegisterForm";
import AnimatedAuthCard from "@/shared/components/molecules/AnimatedAuthCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: `${t("register_title")} – SubSnap` };
}

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <AnimatedAuthCard>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("register_title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("register_subtitle")}
        </p>
      </div>

      <RegisterForm />
    </AnimatedAuthCard>
  );
}
