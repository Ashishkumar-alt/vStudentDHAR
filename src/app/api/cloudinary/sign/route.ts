import { NextResponse } from "next/server";
import crypto from "crypto";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} env var`);
  return v;
}

function validateCloudName(cloudName: string) {
  const v = cloudName.trim();
  if (!v) throw new Error("Cloudinary cloud name is empty.");
  if (v === "..." || v.toLowerCase() === "your_cloud_name") {
    throw new Error("Cloudinary cloud name is not set. Put your real Cloud name in `.env.local`.");
  }
  if (v.includes("http") || v.includes(".") || v.includes("/")) {
    throw new Error("Invalid Cloudinary cloud name. Use only the Cloud name (not a URL).");
  }
  if (!/^[a-z0-9-]+$/.test(v)) {
    throw new Error("Invalid Cloudinary cloud name. Allowed: lowercase letters, numbers, hyphen.");
  }
  return v;
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export async function POST(req: Request) {
  try {
    const cloudName = validateCloudName(requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"));
    const apiKey = requireEnv("NEXT_PUBLIC_CLOUDINARY_API_KEY");
    const apiSecret = requireEnv("CLOUDINARY_API_SECRET");

    const body = (await req.json()) as {
      folder?: string;
      public_id?: string;
      overwrite?: boolean;
    };

    const folder = body.folder?.trim() || "vstudent";
    if (!folder.startsWith("vstudent")) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params: Record<string, string> = { folder, timestamp };
    if (body.public_id) params.public_id = body.public_id;
    if (typeof body.overwrite === "boolean") params.overwrite = body.overwrite ? "true" : "false";

    const signature = signCloudinaryParams(params, apiSecret);
    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      public_id: body.public_id || null,
      overwrite: typeof body.overwrite === "boolean" ? body.overwrite : null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to sign upload" },
      { status: 500 },
    );
  }
}
