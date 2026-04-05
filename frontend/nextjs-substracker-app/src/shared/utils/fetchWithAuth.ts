import { cookies } from "next/headers";   //next.js server-only API for reading/writing cookies
import { API_ENDPOINTS, COOKIE_NAMES } from "@/config";
import type { ApiResponse } from "@/shared/types";

type RefreshData = { 
  accessToken: string; 
  refreshToken: string 
};

/**
 * Prova a rinnovare l'access token usando il refresh token salvato nel cookie.
 * Se riesce, aggiorna entrambi i cookie e restituisce il nuovo access token.
 * Se fallisce (refresh token scaduto o assente), restituisce null.
 */
async function tryRefreshTokens(): Promise<string | null> {

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  //reads refreshtoken from cookie 

  if (!refreshToken) return null;

  try {
    const res = await fetch(API_ENDPOINTS.auth.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });  //invia (grazie a POST) il refresh token al backend per ottenere un nuovo access token
    if (!res.ok) return null;

    const json: ApiResponse<RefreshData> = await res.json();  //x json version
    if (!json.success || !json.data) return null;

    const { accessToken, refreshToken: newRefreshToken } = json.data;  //spacchetti

    cookieStore.set(COOKIE_NAMES.accessToken, accessToken, {
      httpOnly: true,     //JS cannot read it (secure)
      secure: process.env.NODE_ENV === "production",    //HTTPS only in production
      maxAge: 60 * 10,   // 10 minuti — allineato al JWT
      path: "/",
      sameSite: "lax",    //CSRF protection
    });
    cookieStore.set(COOKIE_NAMES.refreshToken, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,  // 30 giorni
      path: "/",
      sameSite: "lax",
    });

    return accessToken;
  } catch {
    return null;
  }
}

export type AuthFetchResult =     //this is a discriminated union type that represents the possible outcomes of fetchWithAuth
  | { sessionExpired: true; response?: never }      //req failed, user is logged out
  | { sessionExpired: false; response: Response };  //req succeeded

/**
 * Wrapper attorno a fetch che:
 * 1. Aggiunge automaticamente il Bearer token dall'access_token cookie
 * 2. Se la risposta è 401 (token scaduto), tenta il refresh automatico
 * 3. Se il refresh va a buon fine, riprova la chiamata originale con il nuovo token
 * 4. Se il refresh fallisce, cancella i cookie e restituisce { sessionExpired: true }
 *    — il chiamante deve fare redirect(ROUTES.login) FUORI da try/catch
 */
export async function fetchWithAuth(
  url: string,    //endpoint da chiamare
  init: RequestInit = {}    //opzioni fetch (method, body, etc.)
): Promise<AuthFetchResult> {

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  //reads refreshtoken from cookie

  const buildHeaders = (t: string | undefined): HeadersInit => {    //helper function for building header
    const base: Record<string, string> = {
      "Content-Type": "application/json",     //sets default
      ...((init.headers as Record<string, string> | undefined) ?? {}),    //if init.headers exists -> use it, if init.headers exists -> use it
    };
    if (t) base["Authorization"] = `Bearer ${t}`;   //add authorization header if token is present
    return base;    //return headers
  };

  const response = await fetch(url, { ...init, headers: buildHeaders(token) });   //spreads original config (init), overrides headers, injects Authorization

  if (response.status !== 401) {
    return { sessionExpired: false, response };
  }
  //if NOT 401, Everything is fine -> return response

  // Access token scaduto — tenta il refresh
  const newToken = await tryRefreshTokens(); //try to refresh tokens, if it fails -> newToken will be null

  if (!newToken) {  //if refresh failed, we consider the session expired and clear cookies
    // Refresh fallito: la sessione è scaduta del tutto
    cookieStore.delete(COOKIE_NAMES.accessToken);
    cookieStore.delete(COOKIE_NAMES.refreshToken);
    cookieStore.delete(COOKIE_NAMES.userInfo);
    return { sessionExpired: true };
  }

  const retryResponse = await fetch(url, { ...init, headers: buildHeaders(newToken) });  //riprova la chiamata originale ma ora con il token fresco
  return { sessionExpired: false, response: retryResponse };    //token is valid, request succeeded

}
