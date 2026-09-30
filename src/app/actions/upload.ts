"use server";

import crypto from "node:crypto";
import { canAccessAdmin } from "@/lib/auth/policies";
import { env } from "@/lib/env";
import {
  IMAGE_MAX_DIMENSION,
  IMAGE_UPLOAD_PURPOSES,
  type ImageUploadPurpose,
  sniffImageType,
  validateImageFile,
} from "@/lib/media/images";
import { logger } from "@/lib/observability/logger";

export interface UploadImageResult {
  success: boolean;
  url?: string;
  width?: number;
  height?: number;
  error?: string;
}

function parsePurpose(value: FormDataEntryValue | null): ImageUploadPurpose {
  return IMAGE_UPLOAD_PURPOSES.find((purpose) => purpose === value) ?? "inline";
}

/** Cloudinary signs every parameter except file and api_key, sorted alphabetically. */
function signParams(params: Record<string, string>) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(`${payload}${env.CLOUDINARY_API_SECRET}`).digest("hex");
}

export async function uploadImageAction(formData: FormData): Promise<UploadImageResult> {
  try {
    await canAccessAdmin();
  } catch {
    return { success: false, error: "Your session has ended. Sign in again to upload images." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "Choose an image to upload." };
  }

  const problem = validateImageFile(file);
  if (problem) return { success: false, error: problem };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const realType = sniffImageType(buffer.subarray(0, 16));
    if (!realType) {
      return { success: false, error: "That file doesn't look like a real image." };
    }

    const purpose = parsePurpose(formData.get("purpose"));
    const params = {
      folder: `twn/${purpose}`,
      timestamp: Math.round(Date.now() / 1000).toString(),
      transformation: `c_limit,w_${IMAGE_MAX_DIMENSION},h_${IMAGE_MAX_DIMENSION}`,
    };

    const body = new FormData();
    body.append("file", `data:${realType};base64,${buffer.toString("base64")}`);
    body.append("api_key", env.CLOUDINARY_API_KEY);
    for (const [key, value] of Object.entries(params)) body.append(key, value);
    body.append("signature", signParams(params));

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body }
    );

    if (!response.ok) {
      logger.error(
        "media.upload.rejected",
        undefined,
        { status: response.status, purpose },
        "media"
      );
      return { success: false, error: "The image service refused this upload. Try another image." };
    }

    const data = (await response.json()) as { secure_url: string; width: number; height: number };
    return { success: true, url: data.secure_url, width: data.width, height: data.height };
  } catch (error) {
    logger.error("media.upload.failed", error, undefined, "media");
    return {
      success: false,
      error: "The upload didn't finish. Check your connection and try again.",
    };
  }
}
