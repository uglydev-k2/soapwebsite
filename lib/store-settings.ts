import { getCheckoutSettings } from "@/lib/checkout";

export type PublicStoreSettings = {
  flatShippingRate: number;
};

export const DEFAULT_PUBLIC_STORE_SETTINGS: PublicStoreSettings = {
  flatShippingRate: 8,
};

export async function getPublicStoreSettings(): Promise<PublicStoreSettings> {
  const settings = await getCheckoutSettings();
  return {
    flatShippingRate: settings.flatShippingRate,
  };
}
