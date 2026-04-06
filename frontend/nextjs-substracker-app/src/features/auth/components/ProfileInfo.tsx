"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { User, Mail, Shield, Calendar, Clock } from "lucide-react";
import Button from "@/shared/components/atoms/Button";
import { logoutAction } from "@/shared/actions/auth.actions";
import type { AuthUser, User as UserProfile } from "@/shared/types";

type Props = {
  user: AuthUser | null;
  profile?: UserProfile | null;
};

function formatDate(iso?: string | null, locale?: string) {  //takes an ISO date str e.g."2026-04-01T10:00:00Z" and converts it into a human readable format
  if (!iso) return "—";
  const dateLocale = locale === "en" ? "en-US" : "it-IT";   //converts in browser locale format
  return new Date(iso).toLocaleDateString(dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); //e.g.EN -> Apr 01, 2026, IT -> 01 apr 2026
}

export default function ProfileInfo({ user, profile }: Props) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">  {/*shrink-0 icon keeps its original size, font-mono all characters have the same width, break-all text can break anywhere (scende alla riga sotto) to AVOID overflow*/}
            <User size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium">{t("account_title")}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("account_subtitle")}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center gap-3">
          <Mail size={15} className="text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("email_label")}</p>
            <p className="text-sm font-medium">{user?.email ?? "—"}</p>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center gap-3">
          <Shield size={15} className="text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("uid_label")}</p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("member_since")}</p>
                <p className="text-sm font-medium">{formatDate(profile.createdAt, locale)}</p>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center gap-3">
              <Clock size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("last_login")}</p>
                <p className="text-sm font-medium">{formatDate(profile.lastLogin, locale)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-sm font-semibold mb-1">{t("session_title")}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t("session_subtitle")}
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? t("signing_out_btn") : t("sign_out_btn")}
        </Button>
      </div>
    </div>
  );
}
