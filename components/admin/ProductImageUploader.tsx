"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import {
  MAX_PRODUCT_IMAGES,
  uploadProductImage,
} from "@/lib/supabase/product-images";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  className?: string;
}

export function ProductImageUploader({
  images,
  onChange,
  className,
}: ProductImageUploaderProps) {
  const addToast = useToastStore((s) => s.addToast);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const storageReady = isSupabaseConfigured();
  const atMax = images.length >= MAX_PRODUCT_IMAGES;
  const remaining = MAX_PRODUCT_IMAGES - images.length;

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      if (!storageReady) {
        addToast("Supabase Storage is not configured", "error");
        return;
      }
      if (atMax) {
        addToast(`Maximum of ${MAX_PRODUCT_IMAGES} images reached`, "error");
        return;
      }

      const files = Array.from(fileList).slice(0, remaining);
      if (!files.length) return;

      setUploading(true);
      const uploaded: string[] = [];

      try {
        for (const file of files) {
          try {
            const publicUrl = await uploadProductImage(file);
            uploaded.push(publicUrl);
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Upload failed";
            addToast(`${file.name}: ${message}`, "error");
          }
        }

        if (uploaded.length) {
          onChange([...images, ...uploaded].slice(0, MAX_PRODUCT_IMAGES));
          addToast(
            uploaded.length === 1
              ? "Image uploaded"
              : `${uploaded.length} images uploaded`
          );
        }
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [addToast, atMax, images, onChange, remaining, storageReady]
  );

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (uploading || atMax) return;
    void uploadFiles(event.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="group relative aspect-square overflow-hidden border border-green/10 bg-cream"
            >
              <Image
                src={url}
                alt={`Product image ${i + 1}`}
                fill
                className="object-cover"
                sizes="160px"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 bg-white/90 p-1.5 text-muted shadow-sm transition-colors hover:text-terra"
                aria-label={`Remove image ${i + 1}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted">
        {images.length} / {MAX_PRODUCT_IMAGES} images
        {images.length > 0
          ? " — saved to the product when you submit the form"
          : ""}
      </p>

      {!storageReady && (
        <p className="rounded border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-muted">
          Set <code className="text-green">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-green">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and
          create a public <code className="text-green">products</code> bucket in
          Supabase Storage.
        </p>
      )}

      {storageReady && !atMax && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!uploading) setIsDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed px-5 py-12 text-center transition-colors sm:gap-3 sm:px-4 sm:py-10",
            isDragging
              ? "border-terra bg-terra/5"
              : "border-green/20 bg-cream/50 hover:border-green/40",
            uploading && "pointer-events-none opacity-70"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={remaining > 1}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) void uploadFiles(e.target.files);
            }}
          />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-terra" />
          ) : (
            <Upload className="h-8 w-8 text-green/40" />
          )}
          <div>
            <p className="text-sm font-medium text-green">
              {uploading ? "Uploading…" : "Drag & drop product photos here"}
            </p>
            <p className="mt-1 text-xs text-muted">
              or click to browse · JPG, PNG, WebP · up to {remaining} more · 5MB
              each
            </p>
          </div>
        </div>
      )}

      {storageReady && atMax && (
        <div className="flex items-center gap-2 border border-green/10 bg-cream/30 px-4 py-3 text-xs text-muted">
          <ImageIcon className="h-4 w-4 shrink-0 text-green/50" />
          Maximum of {MAX_PRODUCT_IMAGES} images reached. Remove one to upload
          another.
        </div>
      )}
    </div>
  );
}
