"use client";

import { motion } from "motion/react";  //plugin Motion x animations
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";  //plugin x langauge translation
import { Link } from "@/i18n/navigation";  //custom Link component w i18n translation support
import Button from "@/shared/components/atoms/Button";
import ToggleDarkMode from "@/shared/components/molecules/ToggleDarkMode";  //component x switch dark mode light mode
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/config";

function UserAvatar({ email }: { email: string }) {  //UseAvatar component x display user avatar w initials
  const initials = email.slice(0, 2).toUpperCase();  //extract inials from email
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 select-none">
      {initials}
    </span>
  ); //styled cicle avatar w initials inside, using Tailwind CSS classes for styling
}

export default function Navbar() {
  const t = useTranslations("nav");  //translations
  const { user, logout } = useAuth();  //spacchetta

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}  //starts 60px above and invisible
      animate={{ y: 0, opacity: 1 }}    //animates to normal position and fully visible
      transition={{ duration: 0.4, ease: "easeOut" }}  //smooth transition
      className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.15 }}>  {/*animation hover -> slightly bigger, click -> slightly smaller*/}
          <Link
            href={ROUTES.dashboard}
            className="text-base font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            {t("brand")}
          </Link>
        </motion.div>

        <nav className="flex items-center gap-1">
          <ToggleDarkMode />

          {user && (
            <>
              <Link href={ROUTES.profile}>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <UserAvatar email={user.email} />
                  <span className="hidden sm:inline max-w-[160px] truncate text-sm">
                    {user.email}
                  </span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                aria-label={t("logout")}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">{t("logout")}</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
