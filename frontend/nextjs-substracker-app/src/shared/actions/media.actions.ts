"use server";

/*
 * Server actions per il flow upload Cloudflare R2.
 *
 * FLOW COMPLETO (vedi AvatarUpload.tsx per orchestrazione client-side):
 * 1. requestUploadUrlAction()  → backend genera presigned URL
 * 2. [client] fetch PUT → R2 (upload diretto, NON passa dal backend)
 * 3. confirmUploadAction()     → backend salva record nel DB
 *
 * URL pubblico finale: https://cdn.substracker.live/{fileKey}
 */

import { cookies } from "next/headers";
import { API_ENDPOINTS, COOKIE_NAMES } from "@/config";
import type { ApiResponse } from "@/shared/types";
import type { ConfirmUploadResponse, UploadUrlResponse } from "@/shared/types/media.types";

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

/**
 * Step 1 — Chiede al backend un presigned URL per caricare il file direttamente su R2.
 * Restituisce uploadUrl (PUT R2), fileKey e publicUrl (CDN).
 */
export async function requestUploadUrlAction(
  fileName: string,
  contentType: string,
  folder: string = "avatars"
): Promise<ActionResult<UploadUrlResponse>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(API_ENDPOINTS.media.uploadUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ fileName, contentType, folder }),
    });

    const json: ApiResponse<UploadUrlResponse> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ??"Impossibile generare URL di upload." };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Errore di rete. Riprova." };
  }
}

/**
 * Step 3 — Conferma al backend che il file è stato caricato su R2.
 * Il backend salva il record UserMedia nel DB e restituisce il publicUrl CDN.
 */
export async function confirmUploadAction(
  fileKey: string,
  contentType: string,
  size: number
): Promise<ActionResult<ConfirmUploadResponse>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(API_ENDPOINTS.media.confirmUpload, {
      method: "POST",
      headers,
      body: JSON.stringify({ fileKey, contentType, size }),
    });

    const json: ApiResponse<ConfirmUploadResponse> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ??"Impossibile confermare upload." };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Errore di rete. Riprova." };
  }
}
