"use client";

/*
 * Componente upload avatar — flow Cloudflare R2 + CDN:
 *
 * 1. User seleziona file (browser)
 * 2. requestUploadUrlAction()   → server action → backend genera presigned URL
 * 3. fetch PUT → R2 direttamente (NO backend, NO CORS issues)
 * 4. confirmUploadAction()      → server action → backend salva record DB
 * 5. UI mostra avatar dal CDN: https://cdn.substracker.live/{fileKey}
 *
 * Limiti: solo immagini, max 5MB.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { requestUploadUrlAction, confirmUploadAction } from "@/shared/actions/media.actions";

const MAX_SIZE_BYTES = 5_000_000; // 5MB

type UploadStatus = "idle" | "uploading" | "success" | "error";

type AvatarUploadProps = {
  currentAvatarUrl?: string;
  onUploadComplete?: (publicUrl: string) => void;
};

export function AvatarUpload({ currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl ?? null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validazione client-side
    if (!file.type.startsWith("image/")) {
      setError("Solo file immagine consentiti.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("File troppo grande. Massimo 5MB.");
      return;
    }

    setError(null);
    setStatus("uploading");
    setProgress(10);

    // preview locale immediata
    setPreview(URL.createObjectURL(file));

    // STEP 1 — chiedi presigned URL al backend
    const urlResult = await requestUploadUrlAction(file.name, file.type, "avatars");
    if (!urlResult.success || !urlResult.data) {
      setError(urlResult.error ?? "Errore generazione URL.");
      setStatus("error");
      return;
    }

    setProgress(30);
    const { uploadUrl, fileKey, publicUrl } = urlResult.data;

    // STEP 2 — PUT diretto su Cloudflare R2 (browser → R2, no backend)
    try {
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        setError("Upload su R2 fallito. Riprova.");
        setStatus("error");
        return;
      }
    } catch {
      setError("Errore di rete durante upload. Riprova.");
      setStatus("error");
      return;
    }

    setProgress(80);

    // STEP 3 — conferma al backend (salva record nel DB)
    const confirmResult = await confirmUploadAction(fileKey, file.type, file.size);
    if (!confirmResult.success) {
      setError(confirmResult.error ?? "Errore conferma upload.");
      setStatus("error");
      return;
    }

    setProgress(100);
    setStatus("success");
    setPreview(publicUrl);
    onUploadComplete?.(publicUrl);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar preview */}
      <div
        className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => inputRef.current?.click()}
        title="Clicca per cambiare avatar"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            fill
            className="object-cover"
            unoptimized // CDN già ottimizzata da Cloudflare
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 text-3xl">?</span>
          </div>
        )}

        {/* overlay spinner durante upload */}
        {status === "uploading" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* progress bar */}
      {status === "uploading" && (
        <div className="w-full max-w-xs h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* bottone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "uploading" ? "Caricamento..." : "Cambia avatar"}
      </button>

      {/* feedback */}
      {status === "success" && (
        <p className="text-sm text-green-500">Avatar aggiornato.</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* input nascosto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
