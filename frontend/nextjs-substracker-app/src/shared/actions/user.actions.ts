"use server";

import { redirect } from "next/navigation";
import { API_ENDPOINTS, ROUTES } from "@/config";
import { fetchWithAuth } from "@/shared/utils/fetchWithAuth";
import type { ApiResponse, User } from "@/shared/types";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getProfileAction(): Promise<ActionResult<User>> {
  const result = await fetchWithAuth(API_ENDPOINTS.users.me, {
    method: "GET",
    cache: "no-store",
  });

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    const json: ApiResponse<User> = await result.response.json();
    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ?? "Failed to fetch profile" };
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
  // Almeno un campo deve essere presente prima di fare la chiamata
  if (!data.newEmail && !data.newPassword) {
    return { success: false, error: "At least one field (email or password) must be provided for update" };
  }

  const result = await fetchWithAuth(API_ENDPOINTS.users.me, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    const json: ApiResponse<User> = await result.response.json();
    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ?? "Failed to update profile" };
    }
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function deleteUserAction(): Promise<ActionResult> {
  const result = await fetchWithAuth(API_ENDPOINTS.users.delete, {
    method: "DELETE",
  });

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    if (result.response.status === 204) return { success: true };
    const json = await result.response.json();
    return { success: false, error: json.error?.message ?? "Failed to delete account" };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}
