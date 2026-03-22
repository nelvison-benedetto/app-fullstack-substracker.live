"use server";

import { cookies } from "next/headers";
import { API_ENDPOINTS, COOKIE_NAMES } from "@/config";
import type { ApiResponse, User } from "@/shared/types";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getProfileAction(): Promise<ActionResult<User>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(API_ENDPOINTS.users.me, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const json: ApiResponse<User> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error ?? "Failed to fetch profile" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function updateProfileAction(data: {
  newEmail?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<ActionResult<User>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(API_ENDPOINTS.users.me, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    const json: ApiResponse<User> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error ?? "Failed to update profile" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}
