import { compressForUpload } from "@/lib/images";

async function fetchUploadSignature(input: {
  folder: string;
  public_id?: string;
  overwrite?: boolean;
}) {
  const res = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as
    | {
        cloudName: string;
        apiKey: string;
        timestamp: string;
        signature: string;
        folder: string;
        public_id: string | null;
        overwrite: boolean | null;
      }
    | { error: string };

  if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : "Failed to sign upload");
  return data;
}

export async function uploadImageToCloudinary(opts: {
  file: File;
  folder: string;
  publicId?: string;
  overwrite?: boolean;
  maxSize?: number; // px
  maxMB?: number;
}) {
  const signed = await fetchUploadSignature({
    folder: opts.folder,
    public_id: opts.publicId,
    overwrite: opts.overwrite,
  });

  const fileToUpload =
    opts.file.size <= 700 * 1024
      ? opts.file
      : await compressForUpload(opts.file, { maxMB: opts.maxMB ?? 0.6, maxSize: opts.maxSize ?? 800 });

  const url = `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`;
  const form = new FormData();
  form.set("file", fileToUpload);
  form.set("api_key", signed.apiKey);
  form.set("timestamp", signed.timestamp);
  form.set("signature", signed.signature);
  form.set("folder", signed.folder);
  if (signed.public_id) form.set("public_id", signed.public_id);
  if (typeof signed.overwrite === "boolean") form.set("overwrite", signed.overwrite ? "true" : "false");

  const res = await fetch(url, { method: "POST", body: form });
  const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }
  return data.secure_url;
}

