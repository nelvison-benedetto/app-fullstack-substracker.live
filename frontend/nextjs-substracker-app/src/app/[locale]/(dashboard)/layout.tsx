import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAMES } from "@/config";
import type { AuthUser } from "@/shared/types";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import Navbar from "@/shared/components/layout/Navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.accessToken);

  if (!token) {
    redirect("/login");
  }

  let initialUser: AuthUser | null = null;
  const userInfoCookie = cookieStore.get(COOKIE_NAMES.userInfo)?.value;
  if (userInfoCookie) {
    try {
      initialUser = JSON.parse(userInfoCookie) as AuthUser;
    } catch {
      initialUser = null;
    }
  }

  return (
    <AuthProvider initialUser={initialUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
