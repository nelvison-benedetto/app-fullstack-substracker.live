"use server";

import { cookies } from "next/headers";
import { API_ENDPOINTS, COOKIE_NAMES } from "@/config";
import type {
  ApiResponse,
  Subscription,
  SubscriptionDetail,
  CreateSubscriptionData,
  UpdateSubscriptionData,
} from "@/shared/types";

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

export async function getSubscriptionsAction(): Promise<ActionResult<Subscription[]>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(API_ENDPOINTS.subscriptions.list, {
      method: "GET",
      headers,
      cache: "no-store",  //sempre dati freschi
    });

    const json: ApiResponse<Subscription[]> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ??"Failed to fetch subscriptions" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function getSubscriptionDetailAction(id: string): Promise<ActionResult<SubscriptionDetail>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(API_ENDPOINTS.subscriptions.detail(id), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const json: ApiResponse<SubscriptionDetail> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ??"Subscription not found" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function createSubscriptionAction(
  data: CreateSubscriptionData
): Promise<ActionResult<Subscription>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(API_ENDPOINTS.subscriptions.create, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const json: ApiResponse<Subscription> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ??"Failed to create subscription" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function updateSubscriptionAction(
  id: string,
  data: UpdateSubscriptionData
): Promise<ActionResult<Subscription>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(API_ENDPOINTS.subscriptions.update(id), {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    const json: ApiResponse<Subscription> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ??"Failed to update subscription" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function deleteSubscriptionAction(id: string): Promise<ActionResult> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(API_ENDPOINTS.subscriptions.delete(id), {
      method: "DELETE",
      headers,
    });

    if (res.status === 204) return { success: true };

    const json = await res.json();
    return { success: false, error: json.error?.message ??"Failed to delete subscription" };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}
