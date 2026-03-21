import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES, ROUTES } from "@/config";

const protectedRoutes = ["/dashboard", "/profile"];  //queste routes richiedono login
const authRoutes = ["/login", "/register"];  //in queste routes non vuoi utenti loggati

//intercetta ogni request, e decide se puo continuare o deve essere redirect da qualche parte (xk magari non sei auth)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;  //e.g. url site.com/dashboard/settings  allora il pathname è '/dashboard/settings'
  const token = request.cookies.get(COOKIE_NAMES.accessToken)?.value;  //legge il cookie, se non esiste return undefined

  const isProtected = protectedRoutes.some((route) =>  //.some() vuol dire Almeno UNO degli elementi soddisfa la condizione?
    pathname.startsWith(route)  //condition
  );
  const isAuthRoute = authRoutes.some((route) => 
    pathname.startsWith(route)
  );

  if (isProtected && !token) {  //e.g. se vai su /dasboard e NON hai il token
    const loginUrl = new URL(ROUTES.login, request.url); //new URL(path, base)  e.g.new URL("/login", "http://localhost:3000/dashboard"). quindi loginUrl diventa http://localhost:3000/login
    loginUrl.searchParams.set("from", pathname);  //aggiunge query param /login?from=/dashboard, cosi dopo il login ritorno alla pagina originale
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {  //e.g. se sei su /login ma sei gia loggato
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));  //redirect automatico a /dashboard
  }

  return NextResponse.next();  //nessun 'problema', continua normalmente
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};  //applica questo middleware a TUTTE le rotte tranne /api /_next/static /_next/image /favicon.ico
