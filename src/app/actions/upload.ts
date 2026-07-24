"use server";

import crypto from "node:crypto";
import { requireAdmin } from "@/lib/auth/require-admin";
import { env } from "@/lib/env";

export async function uploadImageAction(formData: FormData) {
  try {
    // 1. Secure it so only authenticated admins can upload images
    await requireAdmin();

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided." };
    }

    // 2. Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Prepare Cloudinary parameters
    const timestamp = Math.round(new Date().getTime() / 1000);
    // Cloudinary requires signed parameters to be sorted alphabetically
    const paramsToSign = `timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;

    // Hash signature using Node's native crypto module
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

    // 4. Send request to Cloudinary REST API
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    const body = new FormData();
    // Convert buffer to base64 data URI format for Cloudinary
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;
    body.append("file", base64Data);
    body.append("api_key", env.CLOUDINARY_API_KEY);
    body.append("timestamp", timestamp.toString());
    body.append("signature", signature);

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[uploadImageAction] Cloudinary error:", errorText);
      return { success: false, error: "Cloudinary upload failed." };
    }

    const data = await response.json();
    return { success: true, url: data.secure_url };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[uploadImageAction] Error:", err.message);
    return { success: false, error: err.message || "Failed to upload image." };
  }
}
