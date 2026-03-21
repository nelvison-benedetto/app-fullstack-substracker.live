"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import Button from "@/shared/components/atoms/Button";
import ToggleDarkMode from "@/shared/components/molecules/ToggleDarkMode";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/config";

export default function Navbar() {
  
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link
          href={ROUTES.dashboard}
          className="text-base font-semibold tracking-tight"
        >
          SubsTracker
        </Link>

        <nav className="flex items-center gap-2">
          <ToggleDarkMode />

          {user && (
            <>
              <Link href={ROUTES.profile}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <User size={15} />
                  <span className="hidden sm:inline max-w-[180px] truncate">
                    {user.email}
                  </span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-1.5"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
