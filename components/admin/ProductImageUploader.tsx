"use client";

import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";

export const MAX_PRODUCT_IMAGES = 4;

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  uploadReady: boolean;
  className?: string;
}

export function ProductImageUploader({
  images,
  onChange,
  uploadReady,
  className,
}: ProductImageUploaderProps) {
  const addToast = useToastStore((s) => s.addToast);
  const atMax = images.length >= MAX_PRODUCT_IMAGES;
  const remaining = MAX_PRODUCT_IMAGES - images.length;

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const appendUrls = (urls: string[]) => {
    if (!urls.length) return;
    const merged = [...images, ...urls].slice(0, MAX_PRODUCT_IMAGES);
    onChange(merged);
    addToast(
      urls.length === 1 ? "Image uploaded" : `${urls.length} images uploaded`
    );
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
        {images.length > 0 ? " — saved when you create or update the product" : ""}
      </p>

      {uploadReady && !atMax && (
        <UploadDropzone
          endpoint="productImage"
          onBeforeUploadBegin={(files) => files.slice(0, remaining)}
          onClientUploadComplete={(res) => {
            appendUrls(res.map((f) => f.url));
          }}
          onUploadError={(error) => {
            addToast(error.message, "error");
          }}
          appearance={{
            container:
              "border-2 border-dashed border-green/20 bg-cream/50 ut-uploading:bg-cream",
            uploadIcon: "text-green/40",
            label: "text-sm text-green font-medium",
            allowedContent: "text-xs text-muted",
            button:
              "bg-terra text-white text-xs label-caps px-4 py-2 ut-ready:bg-terra ut-uploading:opacity-70",
          }}
          content={{
            label: "Drag & drop product photos here",
            allowedContent: `Up to ${remaining} more · 4MB max each · JPG, PNG, WebP`,
            button: remaining > 1 ? "Choose files" : "Choose file",
          }}
        />
      )}

      {uploadReady && atMax && (
        <p className="text-xs text-muted">
          Maximum of {MAX_PRODUCT_IMAGES} images reached. Remove one to upload
          another.
        </p>
      )}

      {!uploadReady && (
        <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-green/15 bg-cream/30 px-4 py-10 text-center">
          <ImageIcon className="h-8 w-8 text-green/30" />
          <p className="text-sm text-muted">
            Drag-and-drop uploads unavailable until{" "}
            <code className="text-green">UPLOADTHING_TOKEN</code> is set on the
            server.
          </p>
        </div>
      )}
    </div>
  );
}
