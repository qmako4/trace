// Cloudflare R2 client — SERVER-SIDE ONLY.
//
// This file uses R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY (no
// EXPO_PUBLIC_ prefix), which are only present in Node environments
// (the seed script, future Supabase Edge Functions). Importing this
// module from a React Native screen will throw on access because
// the env vars won't be defined — the failure is loud and immediate.
//
// The client app reads R2 images by URL (services/imageCache.ts builds
// the public URL via EXPO_PUBLIC_R2_PUBLIC_URL); it never imports this
// module.

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = "trace-media";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. R2 admin credentials must be set server-side only.`);
  }
  return value;
}

function makeClient(): S3Client {
  const accountId = requireEnv("EXPO_PUBLIC_R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export async function uploadImage(
  key: string,
  file: ArrayBuffer | Uint8Array | Buffer,
  contentType: string,
): Promise<string> {
  const r2 = makeClient();
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file as Uint8Array,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return getR2Url(key);
}

export async function deleteImage(key: string): Promise<void> {
  const r2 = makeClient();
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export function getR2Url(key: string): string {
  const base = process.env.EXPO_PUBLIC_R2_PUBLIC_URL;
  if (!base) {
    throw new Error("Missing EXPO_PUBLIC_R2_PUBLIC_URL");
  }
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}
