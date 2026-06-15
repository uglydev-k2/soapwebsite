"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Script from "next/script";

type SquareCard = {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{
    status: string;
    token?: string;
    errors?: { message?: string }[];
  }>;
  destroy: () => Promise<void>;
};

type SquarePayments = {
  card: () => Promise<SquareCard>;
};

declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => Promise<SquarePayments>;
    };
  }
}

export type SquarePaymentFormHandle = {
  tokenize: () => Promise<string | null>;
  isReady: boolean;
};

type CheckoutConfig = {
  applicationId: string;
  locationId: string;
  scriptUrl: string;
};

export const SquarePaymentForm = forwardRef<SquarePaymentFormHandle>(
  function SquarePaymentForm(_props, ref) {
    const cardRef = useRef<SquareCard | null>(null);
    const [config, setConfig] = useState<CheckoutConfig | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [ready, setReady] = useState(false);
    const [initError, setInitError] = useState("");

    useEffect(() => {
      fetch("/api/checkout/config")
        .then((r) => r.json())
        .then((json) => {
          if (json.data?.applicationId) {
            setConfig(json.data);
          } else {
            setInitError("Payments are not configured yet.");
          }
        })
        .catch(() => setInitError("Unable to load payment form."));
    }, []);

    useEffect(() => {
      if (!config || !scriptLoaded || !window.Square) return;

      let cancelled = false;

      async function initCard() {
        try {
          const payments = await window.Square!.payments(
            config!.applicationId,
            config!.locationId
          );
          const card = await payments.card();
          await card.attach("#square-card-container");
          if (cancelled) {
            await card.destroy();
            return;
          }
          cardRef.current = card;
          setReady(true);
          setInitError("");
        } catch {
          if (!cancelled) {
            setInitError("Could not initialize card form.");
          }
        }
      }

      initCard();

      return () => {
        cancelled = true;
        cardRef.current?.destroy().catch(() => {});
        cardRef.current = null;
        setReady(false);
      };
    }, [config, scriptLoaded]);

    useImperativeHandle(ref, () => ({
      isReady: ready,
      tokenize: async () => {
        if (!cardRef.current) return null;
        const result = await cardRef.current.tokenize();
        if (result.status === "OK" && result.token) {
          return result.token;
        }
        const message =
          result.errors?.[0]?.message ||
          "Card details could not be verified. Please check and try again.";
        throw new Error(message);
      },
    }));

    return (
      <>
        {config?.scriptUrl ? (
          <Script
            src={config.scriptUrl}
            strategy="afterInteractive"
            onLoad={() => setScriptLoaded(true)}
            onError={() => setInitError("Failed to load Square payments.")}
          />
        ) : null}
        <div className="card-border bg-white p-6">
          <h2 className="font-serif text-2xl text-green mb-2">Payment</h2>
          <p className="mb-6 text-sm text-muted">
            Pay securely with your credit or debit card.
          </p>
          <div
            id="square-card-container"
            className="min-h-[3.5rem] rounded-sm border border-green/15 bg-cream/40 p-3"
          />
          {initError ? (
            <p className="mt-3 text-sm text-terra">{initError}</p>
          ) : !ready ? (
            <p className="mt-3 text-sm text-muted">Loading secure payment form…</p>
          ) : null}
        </div>
      </>
    );
  }
);
