"use client";

import { useState } from "react";
import { User, Mail, Shield, Calendar, Clock } from "lucide-react";
import Button from "@/shared/components/atoms/Button";
import { logoutAction } from "@/shared/actions/auth.actions";
import type { AuthUser, User as UserProfile } from "@/shared/types";

type Props = {
  user: AuthUser | null;
  profile?: UserProfile | null;
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProfileInfo({ user, profile }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            <User size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Account</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your personal information
            </p>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center gap-3">
          <Mail size={15} className="text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-sm font-medium">{user?.email ?? "—"}</p>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center gap-3">
          <Shield size={15} className="text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
            <p className="text-sm font-mono text-gray-600 dark:text-gray-300 break-all">
              {user?.id ?? "—"}
            </p>
          </div>
        </div>

        {profile && (
          <>
            <div className="px-6 py-4 flex items-center gap-3">
              <Calendar size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Member since</p>
                <p className="text-sm font-medium">{formatDate(profile.createdAt)}</p>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center gap-3">
              <Clock size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last login</p>
                <p className="text-sm font-medium">{formatDate(profile.lastLogin)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-sm font-semibold mb-1">Session</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Sign out of your account on this device.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
