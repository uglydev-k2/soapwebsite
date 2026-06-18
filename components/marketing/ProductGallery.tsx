"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  name: string;
  images: string[];
  fallbackGradient: string;
}

export default function ProductGallery({
  name,
  images,
  fallbackGradient,
}: ProductGalleryProps) {
  const gallery = useMemo(() => {
    if (images.length > 0) return images;
    return [];
  }, [images]);
  const [active, setActive] = useState(0);
  const activeImage = gallery[active];

  useEffect(() => {
    setActive(0);
  }, [gallery]);

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square card-border overflow-hidden flex items-center justify-center"
        style={{ background: fallbackGradient }}
      >
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <span className="font-serif text-6xl text-white/30">{name[0]}</span>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square overflow-hidden border border-green/10",
                "transition-all duration-250 hover:border-terra",
                active === index && "border-terra"
              )}
              style={{ borderRadius: "2px" }}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
