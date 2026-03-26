import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { COOKIE_NAMES } from "@/config";

const intlMiddleware = createIntlMiddleware(routing);

// Rotte che richiedono autenticazione (senza prefisso locale)
const protectedRoutes = ["/dashboard", "/profile"];
// Rotte accessibili solo a utenti NON autenticati
const authRoutes = ["/login", "/register"];

/** Rileva la locale dalla request (senza eseguire il middleware intl completo) */
function detectLocale(request: NextRequest): string {
  // 1. Cookie preferenza utente
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (localeCookie && routing.locales.includes(localeCookie as "it" | "en")) {
    return localeCookie;
  }

  // 2. Cloudflare CF-IPCountry header
  const cfCountry = request.headers.get("CF-IPCountry");
  if (cfCountry && cfCountry !== "IT") {
    return "en";
  }
  if (cfCountry === "IT") {
    return "it";
  }

  // 3. Accept-Language header
  const acceptLang = request.headers.get("Accept-Language") ?? "";
  if (acceptLang.toLowerCase().startsWith("en")) return "en";

  // 4. Default: italiano
  return routing.defaultLocale;
}

/** Rimuove il prefisso locale dall'URL path */
function getBasePath(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(`/${locale}`.length);
    if (pathname === `/${locale}`) return "/";
  }
  return pathname;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAMES.accessToken)?.value;
  const basePath = getBasePath(pathname);
  const locale = detectLocale(request);
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  const isProtected = protectedRoutes.some((r) => basePath.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => basePath.startsWith(r));

  // Utente non autenticato su rotta protetta → login
  if (isProtected && !token) {
    const loginUrl = new URL(`${prefix}/login`, request.url);
    loginUrl.searchParams.set("from", basePath);
    return NextResponse.redirect(loginUrl);
  }

  // Utente autenticato su rotta auth → dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(`${prefix}/dashboard`, request.url));
  }

  // Sovrascrive Accept-Language con la locale rilevata (CF-IPCountry > cookie > browser)
  // così next-intl usa la nostra logica invece di quella del browser
  const modifiedHeaders = new Headers(request.headers);
  modifiedHeaders.set("Accept-Language", locale);
  const modifiedRequest = new NextRequest(request.url, {
    headers: modifiedHeaders,
    method: request.method,
    body: request.body,
  });

  // Delega tutto il resto a next-intl (locale detection + URL rewriting)
  return intlMiddleware(modifiedRequest);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
