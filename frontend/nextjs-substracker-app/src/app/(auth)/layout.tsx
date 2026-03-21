import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAMES, ROUTES } from "@/config";

export default async function AuthLayout({children,}: { children: React.ReactNode;}) 
{
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.accessToken);

  if (token) {
    redirect(ROUTES.dashboard);
  } {/* quindi se trova il accessToken, allora passa e check page /dashboard , altrimenti continua e reder Login o Register */}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
