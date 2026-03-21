import type { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/config";
import type { AuthUser } from "@/shared/types";
import ProfileInfo from "@/features/auth/components/ProfileInfo";

export const metadata: Metadata = {
  title: "Profile – SubsTracker",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  let user: AuthUser | null = null;
  const userInfoCookie = cookieStore.get(COOKIE_NAMES.userInfo)?.value;
  if (userInfoCookie) {
    try {
      user = JSON.parse(userInfoCookie) as AuthUser;
    } catch {
      user = null;
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings
        </p>
      </div>

      <ProfileInfo user={user} />
    </div>
  );
}
