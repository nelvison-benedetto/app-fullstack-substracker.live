import type { Metadata } from "next";
import { getProfileAction } from "@/shared/actions/user.actions";
import ProfileInfo from "@/features/auth/components/ProfileInfo";
import ChangeEmailForm from "@/features/profile/components/ChangeEmailForm";
import ChangePasswordForm from "@/features/profile/components/ChangePasswordForm";
import { AvatarUpload } from "@/features/profile/components/AvatarUpload";
import DeleteAccountSection from "@/features/profile/components/DeleteAccountSection";
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

      {/* Avatar upload */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-sm font-semibold mb-1">Avatar</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Upload a profile picture. Max 5MB, images only.
        </p>
        <AvatarUpload />
      </div>

      {/* Account info + logout */}
      <ProfileInfo user={user} profile={profile} />

      {/* Change email */}
      {profile && (
        <ChangeEmailForm currentEmail={profile.email} />
      )}

      {/* Change password */}
      <ChangePasswordForm />

      {/* Delete account */}
      <DeleteAccountSection />
    </div>
  );
}
