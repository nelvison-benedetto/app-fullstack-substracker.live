import type { Metadata } from "next";
import RegisterForm from "@/features/auth/components/RegisterForm";
import AnimatedAuthCard from "@/shared/components/molecules/AnimatedAuthCard";

export const metadata: Metadata = {
  title: "Create Account – SubsTracker",
};

export default function RegisterPage() {
  return (
    <AnimatedAuthCard>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Start tracking your subscriptions
        </p>
      </div>

      <RegisterForm />
    </AnimatedAuthCard>
  );
}
