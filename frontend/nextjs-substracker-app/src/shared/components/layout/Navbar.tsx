"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import Button from "@/shared/components/atoms/Button";
import ToggleDarkMode from "@/shared/components/molecules/ToggleDarkMode";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/config";

function UserAvatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 select-none">
      {initials}
    </span>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.15 }}>
          <Link
            href={ROUTES.dashboard}
            className="text-base font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            SubsTracker
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
                aria-label="Logout"
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
