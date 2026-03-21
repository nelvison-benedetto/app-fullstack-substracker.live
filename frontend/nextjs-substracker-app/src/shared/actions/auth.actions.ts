"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_ENDPOINTS, COOKIE_NAMES, ROUTES } from "@/config";
import type {
  ApiResponse,
  LoginResponseData,
  RegisterResponseData,
  AuthUser,
} from "@/shared/types";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    const res = await fetch(API_ENDPOINTS.auth.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json: ApiResponse<LoginResponseData> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error ?? "Login failed" };
    }

    const { accessToken, refreshToken, user } = json.data;  //spacchetto data
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAMES.accessToken, accessToken, {  //salva token login
      httpOnly: true,  //non accessibile da js, x security
      secure: process.env.NODE_ENV === "production",  //solo https in produzione
      maxAge: 60 * 60,  //dura 1h
      path: "/",
      sameSite: "lax",  //protegge da CSRF, security
    });

    cookieStore.set(COOKIE_NAMES.refreshToken, refreshToken, {  //salva refresh token
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,  //30gg
      path: "/",
      sameSite: "lax",
    });

    const userInfo: AuthUser = user ?? { id: "", email };  //get userinfo, o fallback.
    cookieStore.set(COOKIE_NAMES.userInfo, JSON.stringify(userInfo), {  //salvi user info
      httpOnly: false,  //accessibile dal browser (UI)!!
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return { success: true };

  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function registerAction(
  email: string,
  password: string
): Promise<ActionResult & { data?: RegisterResponseData }> {
  try {
    const res = await fetch(API_ENDPOINTS.auth.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json: ApiResponse<RegisterResponseData> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error ?? "Registration failed" };
    }

    return { success: true, data: json.data };

  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;

  if (refreshToken) {
    try {
      await fetch(API_ENDPOINTS.auth.logout, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Continue with logout even if API call fails
    }
  }

  //dicono al browser 'alla prossima risposta http, manda un'istruzione al browser web per cancellare questi cookie'.
  cookieStore.delete(COOKIE_NAMES.accessToken);
  cookieStore.delete(COOKIE_NAMES.refreshToken);
  cookieStore.delete(COOKIE_NAMES.userInfo);

  redirect(ROUTES.login);
}

export async function getServerUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get(COOKIE_NAMES.userInfo)?.value;

  if (!userInfoCookie) return null;

  try {
    return JSON.parse(userInfoCookie) as AuthUser;
  } catch {
    return null;
  }
}
