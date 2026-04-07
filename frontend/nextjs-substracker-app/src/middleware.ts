import { NextRequest, NextResponse } from "next/server";  //NextRequest -> incoming request, NextResponse -> what you return (redirect, rewrite, etc.)
import createIntlMiddleware from "next-intl/middleware";  //next-intl handles locale-based routing (en/it) & translations
import { routing } from "@/i18n/routing";  //from ur file
import { COOKIE_NAMES } from "@/config";  //from ur file

/*

*/

const intlMiddleware = createIntlMiddleware(routing);  //official next-intl middleware, but we'll modify the request before passing it to this to implement our custom locale detection logic

const protectedRoutes = ["/dashboard", "/profile"];
//pages that require login

const authRoutes = ["/login", "/register"];
//pages ONLY for unauthenticated users


/**Rileva la locale dalla request (senza eseguire il middleware intl completo) */
function detectLocale(request: NextRequest): string {

  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  //if user previously chose language -> use it (but only if it's a supported locale, to avoid issues with invalid cookies)

  if (localeCookie && routing.locales.includes(localeCookie as "it" | "en")) {
    return localeCookie;
  }
  //ensure it's valid (it or en)

  const cfCountry = request.headers.get("CF-IPCountry");  //cloudflare ti dice dove si trova l'utente (posizione geografica)
  if (cfCountry && cfCountry !== "IT") {
    return "en";
  }
  if (cfCountry === "IT") {
    return "it";
  }

  const acceptLang = request.headers.get("Accept-Language") ?? "";  //fallback to browser preference (read metadata in the Header)
  if (acceptLang.toLowerCase().startsWith("en")) return "en";

  return routing.defaultLocale;  //final fallback (probabilmente italiano)
}


function getBasePath(pathname: string): string {   //removes locale prefix from URL path (e.g. /en/dashboard -> /dashboard) so we can check it against protected/auth routes without worrying about locale
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(`/${locale}`.length);
    if (pathname === `/${locale}`) return "/";
  }
  return pathname;
}


export function middleware(request: NextRequest) {  //main middleware function that runs on every request (except for static files, api routes, etc. as defined in config.matcher)
  const { pathname } = request.nextUrl;   //current path
  const token = request.cookies.get(COOKIE_NAMES.accessToken)?.value;   //auth token
  const basePath = getBasePath(pathname);
  const locale = detectLocale(request);
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;  //default (en) -> "", italian -> "/it"

  const isProtected = protectedRoutes.some((r) => basePath.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => basePath.startsWith(r));

   
  if(isProtected && !token) {  //user NON autenticato su rotta protetta -> redirect su login!!
    const loginUrl = new URL(`${prefix}/login`, request.url);
    loginUrl.searchParams.set("from", basePath);  // e.g. /login?from=/dashboard
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {  //user autenticato su rotta auth -> redirect su dashboard!!
    return NextResponse.redirect(new URL(`${prefix}/dashboard`, request.url));
  }

  // Sovrascrive Accept-Language con la locale rilevata (CF-IPCountry > cookie > browser)
  // così next-intl usa la nostra logica invece di quella del browser
  const modifiedHeaders = new Headers(request.headers);  //clone of original header of the req che arriva a questo middleware.
  modifiedHeaders.set("Accept-Language", locale);
  const modifiedRequest = new NextRequest(request.url, {  //RE-CREATE the request but now with modified headers (Accept-Language = our detected locale)!!
    headers: modifiedHeaders,
    method: request.method,
    body: request.body,
  });

  return intlMiddleware(modifiedRequest);  //delegate to next-intl middleware, which will read the Accept-Language header we set and rewrite the URL to include the locale prefix if needed (e.g. /dashboard -> /en/dashboard or /it/dashboard) based on our detection logic. It will also handle setting the NEXT_LOCALE cookie based on user choice.
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
//middleware runs on all routes except those matching the pattern in matcher (static files, api routes, etc.)
