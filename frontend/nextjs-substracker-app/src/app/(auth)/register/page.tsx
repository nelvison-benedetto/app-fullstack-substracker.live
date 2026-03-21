import type { Metadata } from "next";
import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account – SubsTracker",
};

export default function RegisterPage() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Start tracking your subscriptions
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
