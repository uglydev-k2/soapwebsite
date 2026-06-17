import { getCheckoutSettings } from "@/lib/checkout";

export type PublicStoreSettings = {
  freeShippingThreshold: number;
  flatShippingRate: number;
};

export const DEFAULT_PUBLIC_STORE_SETTINGS: PublicStoreSettings = {
  freeShippingThreshold: 60,
  flatShippingRate: 8,
};

export async function getPublicStoreSettings(): Promise<PublicStoreSettings> {
  const settings = await getCheckoutSettings();
  return {
    freeShippingThreshold: settings.freeShippingThreshold,
    flatShippingRate: settings.flatShippingRate,
  };
}
