import { getCheckoutSettings } from "@/lib/checkout";

export type PublicStoreSettings = {
  flatShippingRate: number;
  freeShippingThreshold: number;
};

export const DEFAULT_PUBLIC_STORE_SETTINGS: PublicStoreSettings = {
  flatShippingRate: 8,
  freeShippingThreshold: 75,
};

export async function getPublicStoreSettings(): Promise<PublicStoreSettings> {
  const settings = await getCheckoutSettings();
  return {
    flatShippingRate: settings.flatShippingRate,
    freeShippingThreshold: settings.freeShippingThreshold,
  };
}
