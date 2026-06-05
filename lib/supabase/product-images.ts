import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const PRODUCT_IMAGE_BUCKET = "products";
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 4;

export const ACCEPTED_PRODUCT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function isAcceptedProductImage(file: File): boolean {
  return ACCEPTED_PRODUCT_IMAGE_TYPES.includes(
    file.type as (typeof ACCEPTED_PRODUCT_IMAGE_TYPES)[number]
  );
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/** Upload a single product image to Supabase Storage and return its public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
  if (!isAcceptedProductImage(file)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed");
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Each image must be 5MB or less");
  }

  const supabase = createClient();
  const path = `${Date.now()}-${sanitizeFileName(file.name)}`;

  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicData } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}
