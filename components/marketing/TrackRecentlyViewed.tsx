"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

interface TrackRecentlyViewedProps {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

export function TrackRecentlyViewed(props: TrackRecentlyViewedProps) {
  const add = useRecentlyViewedStore((s) => s.add);

  useEffect(() => {
    add({
      productId: props.productId,
      name: props.name,
      slug: props.slug,
      price: props.price,
      image: props.image,
    });
  }, [add, props.productId, props.name, props.slug, props.price, props.image]);

  return null;
}
