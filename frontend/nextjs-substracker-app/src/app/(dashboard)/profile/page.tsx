import type { Metadata } from "next";
import { getProfileAction } from "@/shared/actions/user.actions";
import ProfileInfo from "@/features/auth/components/ProfileInfo";
import ChangeEmailForm from "@/features/profile/components/ChangeEmailForm";
import ChangePasswordForm from "@/features/profile/components/ChangePasswordForm";
import type { AuthUser } from "@/shared/types";

export const metadata: Metadata = {
  title: "Profile – SubsTracker",
};

export default async function ProfilePage() {
  const result = await getProfileAction();
  const profile = result.data ?? null;

  const user: AuthUser | null = profile
    ? { id: profile.id, email: profile.email }
    : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Account info + logout */}
      <ProfileInfo user={user} profile={profile} />

      {/* Change email */}
      {profile && (
        <ChangeEmailForm currentEmail={profile.email} />
      )}

      {/* Change password */}
      <ChangePasswordForm />
    </div>
  );
}
