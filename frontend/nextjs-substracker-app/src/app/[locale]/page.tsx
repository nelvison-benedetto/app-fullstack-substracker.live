import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAMES } from "@/config";
import WelcomePageContent from "@/features/welcome/WelcomePageContent";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.accessToken);

  if (token) {
    redirect("/dashboard");
  }

  return <WelcomePageContent />;
}
