import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProfileAction } from "@/shared/actions/user.actions";
import ProfileInfo from "@/features/auth/components/ProfileInfo";
import ChangeEmailForm from "@/features/profile/components/ChangeEmailForm";
import ChangePasswordForm from "@/features/profile/components/ChangePasswordForm";
import { AvatarUpload } from "@/features/profile/components/AvatarUpload";
import DeleteAccountSection from "@/features/profile/components/DeleteAccountSection";
import AnimatedSection from "@/shared/components/molecules/AnimatedSection";
import type { AuthUser } from "@/shared/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: `${t("title")} – SubSnap` };
}

export default async function ProfilePage() {
  const [result, t] = await Promise.all([
    getProfileAction(),
    getTranslations("profile"),
  ]);

  const profile = result.data ?? null;
  const user: AuthUser | null = profile
    ? { id: profile.id, email: profile.email }
    : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <AnimatedSection delay={0}>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("subtitle")}</p>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-sm font-semibold mb-1">{t("avatar_title")}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t("avatar_subtitle")}</p>
          <AvatarUpload />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.18}>
        <ProfileInfo user={user} profile={profile} />
      </AnimatedSection>

      {profile && (
        <AnimatedSection delay={0.26}>
          <ChangeEmailForm currentEmail={profile.email} />
        </AnimatedSection>
      )}

      <AnimatedSection delay={0.34}>
        <ChangePasswordForm />
      </AnimatedSection>

      <AnimatedSection delay={0.42}>
        <DeleteAccountSection />
      </AnimatedSection>
    </div>
  );
}
