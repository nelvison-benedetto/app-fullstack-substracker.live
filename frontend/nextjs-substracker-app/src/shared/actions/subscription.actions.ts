"use server";

import { redirect } from "next/navigation";
import { API_ENDPOINTS, ROUTES } from "@/config";
import { fetchWithAuth } from "@/shared/utils/fetchWithAuth";
import type {
  ApiResponse,
  Subscription,
  SubscriptionDetail,
  CreateSubscriptionData,
  UpdateSubscriptionData,
} from "@/shared/types";

type ActionResult<T = void> = {  //ti serve il wrapper, cosi passi anche metadata success:true/false & errors alla UI, superchiara x UI!! 
  success: boolean;
  data?: T;
  error?: string;
};

export async function getSubscriptionsAction(): Promise<ActionResult<Subscription[]>> {
  //Promise<> bc is async, ActionResult<> bc we want to return success/error status and data if successful
  const result = await fetchWithAuth(API_ENDPOINTS.subscriptions.list, {
    method: "GET",
    cache: "no-store",  //always fresh data (no caching)
  });

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    const json: ApiResponse<Subscription[]> = await result.response.json();
    /*
    //check also api.types.ts
    1.backend returns
    {
      "success": true,
      "data": [
        { "id": "1", "name": "Netflix", "amount": 10 }
      ],
      "error": null
    }
    2.now after .json()
    {
      success: true,
      data: [
        { id: "1", name: "Netflix", amount: 10 }
      ],
      error: null
    }
    3.ts typing so becomes
    {
      success: boolean;
      data: Subscription[] | null;
      error: ApiError | null;
    }
    */

    if (!json.success || !json.data) {
      console.error("[getSubscriptionsAction] API error:", result.response.status, json.error);
      return { success: false, error: json.error?.message ?? `Server error ${result.response.status}` };
    }
    return { success: true, data: json.data };
  } catch (err) {
    console.error("[getSubscriptionsAction] Parse error:", err, "status:", result.response.status);
    return { success: false, error: `Network error (status ${result.response.status})` };
  }
}

export async function getSubscriptionDetailAction(id: string): Promise<ActionResult<SubscriptionDetail>> {
  const result = await fetchWithAuth(API_ENDPOINTS.subscriptions.detail(id), {
    method: "GET",
    cache: "no-store",   //always fresh data (no caching)
  });

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    const json: ApiResponse<SubscriptionDetail> = await result.response.json();
    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ?? "Subscription not found" };
    }
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function createSubscriptionAction(
  data: CreateSubscriptionData
): Promise<ActionResult<Subscription>> {
  const result = await fetchWithAuth(API_ENDPOINTS.subscriptions.create, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    const json: ApiResponse<Subscription> = await result.response.json();
    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ?? "Failed to create subscription" };
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
  const result = await fetchWithAuth(API_ENDPOINTS.subscriptions.update(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    const json: ApiResponse<Subscription> = await result.response.json();
    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ?? "Failed to update subscription" };
    }
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function deleteSubscriptionAction(id: string): Promise<ActionResult> {
  const result = await fetchWithAuth(API_ENDPOINTS.subscriptions.delete(id), {
    method: "DELETE",
  });

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    if (result.response.status === 204) return { success: true };
    const json = await result.response.json();
    return { success: false, error: json.error?.message ?? "Failed to delete subscription" };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}
