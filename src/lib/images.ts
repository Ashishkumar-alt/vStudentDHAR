import imageCompression from "browser-image-compression";

export async function compressForUpload(file: File, options?: { maxMB?: number; maxSize?: number }) {
  const compressed = await imageCompression(file, {
    maxSizeMB: options?.maxMB ?? 0.7,
    maxWidthOrHeight: options?.maxSize ?? 1600,
    // Web workers can hang on some devices/browsers (esp. low-memory mobile).
    useWebWorker: false,
  });
  return compressed;
}
