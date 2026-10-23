"use client";

import { useEffect } from "react";
import type { SubscriptionCadence } from "@/lib/subscriptions";

const STORAGE_KEY = "msvee-subscribe-cadence";

export function saveSubscribeCheckoutIntent(cadence: SubscriptionCadence) {
  try {
    sessionStorage.setItem(STORAGE_KEY, cadence);
  } catch {
    /* private browsing */
  }
}

export function consumeSubscribeCheckoutIntent(): SubscriptionCadence | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (raw === "monthly" || raw === "bimonthly" || raw === "quarterly") {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return null;
}

type SubscribeCheckoutIntentProps = {
  cadence: SubscriptionCadence;
};

/** Persists subscribe intent from /collections?subscribe=… until checkout. */
export function SubscribeCheckoutIntent({ cadence }: SubscribeCheckoutIntentProps) {
  useEffect(() => {
    saveSubscribeCheckoutIntent(cadence);
  }, [cadence]);

  return null;
}
