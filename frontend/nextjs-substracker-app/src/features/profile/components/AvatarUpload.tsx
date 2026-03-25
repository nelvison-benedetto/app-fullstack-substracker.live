"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { requestUploadUrlAction, confirmUploadAction } from "@/shared/actions/media.actions";

const MAX_SIZE_BYTES = 5_000_000; // 5MB

type UploadStatus = "idle" | "uploading" | "success" | "error";

type AvatarUploadProps = {
  currentAvatarUrl?: string;
  onUploadComplete?: (publicUrl: string) => void;
};

export function AvatarUpload({ currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const t = useTranslations("profile");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl ?? null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("avatar_err_type"));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(t("avatar_err_size"));
      return;
    }

    setError(null);
    setStatus("uploading");
    setProgress(10);
    setPreview(URL.createObjectURL(file));

    const urlResult = await requestUploadUrlAction(file.name, file.type, "avatars");
    if (!urlResult.success || !urlResult.data) {
      setError(urlResult.error ?? t("avatar_err_url"));
      setStatus("error");
      return;
    }

    setProgress(30);
    const { uploadUrl, fileKey, publicUrl } = urlResult.data;

    try {
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        setError(t("avatar_err_upload"));
        setStatus("error");
        return;
      }
    } catch {
      setError(t("avatar_err_network"));
      setStatus("error");
      return;
    }

    setProgress(80);

    const confirmResult = await confirmUploadAction(fileKey, file.type, file.size);
    if (!confirmResult.success) {
      setError(confirmResult.error ?? t("avatar_err_confirm"));
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
      <div
        className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <Image src={preview} alt="Avatar" fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 text-3xl">?</span>
          </div>
        )}

        {status === "uploading" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {status === "uploading" && (
        <div className="w-full max-w-xs h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "uploading" ? t("avatar_uploading") : t("avatar_change_btn")}
      </button>

      {status === "success" && (
        <p className="text-sm text-green-500">{t("avatar_updated")}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

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
