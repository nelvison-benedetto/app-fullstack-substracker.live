import type { Metadata } from "next";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In – SubsTracker",
};

type Props = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { registered } = await searchParams;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
      {registered === "true" && (
        <div className="mb-5 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Account created successfully! Please sign in.
        </div>
      )}

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sign in to your SubsTracker account
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
