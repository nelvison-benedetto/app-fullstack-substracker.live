import type { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/config";
import type { AuthUser } from "@/shared/types";

export const metadata: Metadata = {
  title: "Dashboard – SubsTracker",
};

export default async function DashboardPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back{user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Subscriptions", value: "–" },
          { label: "Monthly Spend", value: "–" },
          { label: "Annual Spend", value: "–" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-base font-semibold mb-4">Your Subscriptions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Subscription management coming soon.
        </p>
      </div>
    </div>
  );
}
