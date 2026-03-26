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
import type { User } from "@/shared/types/user.types";

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
      return { success: false, error: json.error?.message ?? "Login failed" };
    }

    const { accessToken, refreshToken } = json.data;
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAMES.accessToken, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,   // 10 minuti — allineato all'AccessTokenExpiryMinutes nel backend
      path: "/",
      sameSite: "lax",
    });

    cookieStore.set(COOKIE_NAMES.refreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,  // 30 giorni — allineato al RefreshTokenExpiryDays nel backend
      path: "/",
      sameSite: "lax",
    });

    // Fetch real user info (id + email) using the token we just got
    let userInfo: AuthUser = { id: "", email };
    try {
      const profileRes = await fetch(API_ENDPOINTS.users.me, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });
      const profileJson: ApiResponse<User> = await profileRes.json();
      if (profileJson.success && profileJson.data) {
        userInfo = { id: profileJson.data.id, email: profileJson.data.email };
      }
    } catch {
      // Non-blocking: fallback to email only
    }

    cookieStore.set(COOKIE_NAMES.userInfo, JSON.stringify(userInfo), {
      httpOnly: false,  // accessibile dal browser (UI)
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,   // 10 minuti — allineato all'access token
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
      return { success: false, error: json.error?.message ?? "Registration failed" };
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
    const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
    try {
      await fetch(API_ENDPOINTS.auth.logout, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Continue with logout even if API call fails
    }
  }

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
