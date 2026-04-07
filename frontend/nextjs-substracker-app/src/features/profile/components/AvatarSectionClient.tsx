"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { AvatarUpload } from "./AvatarUpload";

type Props = {
  currentAvatarUrl?: string;
};

export function AvatarSectionClient({ currentAvatarUrl }: Props) {
  const { user, setUser } = useAuth();

  return (
    <AvatarUpload
      currentAvatarUrl={currentAvatarUrl}
      onUploadComplete={(publicUrl) => {
        if (user) setUser({ ...user, avatarUrl: publicUrl });
      }}
    />
  );
}
