"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_PUBLIC_STORE_SETTINGS,
  type PublicStoreSettings,
} from "@/lib/store-settings";

const StoreSettingsContext = createContext<PublicStoreSettings>(
  DEFAULT_PUBLIC_STORE_SETTINGS
);

export function StoreSettingsProvider({
  settings,
  children,
}: {
  settings: PublicStoreSettings;
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings(): PublicStoreSettings {
  return useContext(StoreSettingsContext);
}
