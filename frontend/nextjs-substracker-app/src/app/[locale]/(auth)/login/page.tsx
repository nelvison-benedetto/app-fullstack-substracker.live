import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/features/auth/components/LoginForm";
import AnimatedAuthCard from "@/shared/components/molecules/AnimatedAuthCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: `${t("login_title")} – SubSnap` };
}
//load translations, sets page title dinamically

type Props = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  
  const { registered } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <AnimatedAuthCard>
      {registered === "true" && (
        <div className="mb-5 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {t("registered_banner")}
        </div>
      )}

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("login_title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("login_subtitle")}
        </p>
      </div>

      <LoginForm />
    </AnimatedAuthCard>
  );
}
