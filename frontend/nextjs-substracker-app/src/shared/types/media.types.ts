
export type UploadUrlResponse = {
  uploadUrl: string;     //presigned URL per PUT diretto su R2 (scade 5 min)
  fileKey: string;       //es. "avatars/uuid-photo.png"
  publicUrl: string;     //https://cdn.substracker.live/{fileKey}
};

export type ConfirmUploadResponse = {
  publicUrl: string;     //URL CDN finale del file caricato
};
