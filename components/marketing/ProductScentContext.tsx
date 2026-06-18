"use client";

import { createContext, useContext } from "react";
import type { ScentVariant } from "@/lib/product-variants";
import type { Product } from "@prisma/client";

type ProductScentContextValue = {
  product: Product;
  activeVariant: ScentVariant | null;
};

const ProductScentContext = createContext<ProductScentContextValue | null>(null);

export function ProductScentProvider({
  product,
  activeVariant,
  children,
}: {
  product: Product;
  activeVariant: ScentVariant | null;
  children: React.ReactNode;
}) {
  return (
    <ProductScentContext.Provider value={{ product, activeVariant }}>
      {children}
    </ProductScentContext.Provider>
  );
}

export function useProductScent() {
  return useContext(ProductScentContext);
}
