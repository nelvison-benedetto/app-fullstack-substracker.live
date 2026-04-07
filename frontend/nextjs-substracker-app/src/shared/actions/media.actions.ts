"use server";

import { redirect } from "next/navigation";
import { API_ENDPOINTS, ROUTES } from "@/config";
import { fetchWithAuth } from "@/shared/utils/fetchWithAuth";
import type { ApiResponse } from "@/shared/types";
import type { ConfirmUploadResponse, UploadUrlResponse } from "@/shared/types/media.types";

/*
!!!PRE-SIGNED URL technique (x upload imgs)
1. Frontend → Backend → asks for upload URL
2. Frontend → Cloudflare R2 → uploads file directly
3. Frontend → Backend → confirms upload
*/
/*
 server actions per il flow upload IMAGES on Cloudflare R2."
 FLOW COMPLETO (vedi AvatarUpload.tsx per orchestrazione client-side):
 1. requestUploadUrlAction()  -> backend genera presigned URL
 2. [client] fetch PUT -> R2 (upload diretto, NON passa dal backend)
 3. confirmUploadAction() -> backend salva record nel DB
 
 URL pubblico finale: https://cdn.substracker.live/{fileKey}
*/

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};


export async function requestUploadUrlAction(
  fileName: string,
  contentType: string,
  folder: string = "avatars"
): Promise<ActionResult<UploadUrlResponse>> {
  const result = await fetchWithAuth(API_ENDPOINTS.media.uploadUrl, {
    method: "POST",
    body: JSON.stringify({ fileName, contentType, folder }),
  });
  /*
  you send to backend
  {
    "fileName": "avatar.png",
    "contentType": "image/png",
    "folder": "avatars"
  }
  backend generates unique fileKey (e.g. avatars/user123.png), creates pre-signed URL for that fileKey and returns to frontend
  {
    "uploadUrl": "...",   // PUT here!! non accade in questo file, ma questo deve essere fatto per uploadare direttamente su R2(senza passare dal backend)
    "fileKey": "...",
    "publicUrl": "https://cdn..."
  }
  */

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    const json: ApiResponse<UploadUrlResponse> = await result.response.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ?? "Impossibile generare URL di upload." };
    }
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Errore di rete. Riprova." };
  }
}


/*
 3. conferma al backend che il file è stato caricato su R2.
 il backend salva il record UserMedia nel DB e restituisce il publicUrl CDN.
*/
export async function getMyAvatarAction(): Promise<ActionResult<string>> {
  const result = await fetchWithAuth(API_ENDPOINTS.media.myMedia, {
    method: "GET",
    cache: "no-store",
  });

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    const json: ApiResponse<string[]> = await result.response.json();
    if (!json.success || !json.data) {
      return { success: false };
    }
    // first item = most recent (sorted by UploadedAt DESC in UserMediaRepository)
    const latest = json.data[0] ?? null;
    return latest ? { success: true, data: latest } : { success: false };
  } catch {
    return { success: false };
  }
}


export async function confirmUploadAction(
  fileKey: string,
  contentType: string,
  size: number
): Promise<ActionResult<ConfirmUploadResponse>> {

  const result = await fetchWithAuth(API_ENDPOINTS.media.confirmUpload, {
    method: "POST",
    body: JSON.stringify({ fileKey, contentType, size }),
  });
  //il backend verifies file exists in R2, saves record in DB(e.g.UserMedia), links it to the user, and returns str publicUrl (e.g.https://cdn.substracker.live/avatars/user123.png)

  if (result.sessionExpired) redirect(ROUTES.login);

  try {
    const json: ApiResponse<ConfirmUploadResponse> = await result.response.json();
    if (!json.success || !json.data) {
      return { success: false, error: json.error?.message ?? "Impossibile confermare upload." };
    }
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Errore di rete. Riprova." };
  }

}
