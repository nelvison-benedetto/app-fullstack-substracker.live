import { cookies } from "next/headers";
import { API_ENDPOINTS, COOKIE_NAMES } from "@/config";
import type { ApiResponse } from "@/shared/types";

type RefreshData = { accessToken: string; refreshToken: string };

/**
 * Prova a rinnovare l'access token usando il refresh token salvato nel cookie.
 * Se riesce, aggiorna entrambi i cookie e restituisce il nuovo access token.
 * Se fallisce (refresh token scaduto o assente), restituisce null.
 */
async function tryRefreshTokens(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(API_ENDPOINTS.auth.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json: ApiResponse<RefreshData> = await res.json();
    if (!json.success || !json.data) return null;

    const { accessToken, refreshToken: newRefreshToken } = json.data;

    cookieStore.set(COOKIE_NAMES.accessToken, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,   // 10 minuti — allineato al JWT
      path: "/",
      sameSite: "lax",
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

export type AuthFetchResult =
  | { sessionExpired: true; response?: never }
  | { sessionExpired: false; response: Response };

/**
 * Wrapper attorno a fetch che:
 * 1. Aggiunge automaticamente il Bearer token dall'access_token cookie
 * 2. Se la risposta è 401 (token scaduto), tenta il refresh automatico
 * 3. Se il refresh va a buon fine, riprova la chiamata originale con il nuovo token
 * 4. Se il refresh fallisce, cancella i cookie e restituisce { sessionExpired: true }
 *    — il chiamante deve fare redirect(ROUTES.login) FUORI da try/catch
 */
export async function fetchWithAuth(
  url: string,
  init: RequestInit = {}
): Promise<AuthFetchResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.accessToken)?.value;

  const buildHeaders = (t: string | undefined): HeadersInit => {
    const base: Record<string, string> = {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string> | undefined) ?? {}),
    };
    if (t) base["Authorization"] = `Bearer ${t}`;
    return base;
  };

  const response = await fetch(url, { ...init, headers: buildHeaders(token) });

  if (response.status !== 401) {
    return { sessionExpired: false, response };
  }

  // Access token scaduto — tenta il refresh
  const newToken = await tryRefreshTokens();

  if (!newToken) {
    // Refresh fallito: la sessione è scaduta del tutto
    cookieStore.delete(COOKIE_NAMES.accessToken);
    cookieStore.delete(COOKIE_NAMES.refreshToken);
    cookieStore.delete(COOKIE_NAMES.userInfo);
    return { sessionExpired: true };
  }

  // Riprova la chiamata originale con il token fresco
  const retryResponse = await fetch(url, { ...init, headers: buildHeaders(newToken) });
  return { sessionExpired: false, response: retryResponse };
}
