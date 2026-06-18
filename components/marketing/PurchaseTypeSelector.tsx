"use client";

import { cn } from "@/lib/utils";
import {
  SUBSCRIPTION_CADENCES,
  type PurchaseType,
  type SubscriptionCadence,
} from "@/lib/subscriptions";

type PurchaseTypeSelectorProps = {
  purchaseType: PurchaseType;
  cadence: SubscriptionCadence;
  onPurchaseTypeChange: (value: PurchaseType) => void;
  onCadenceChange: (value: SubscriptionCadence) => void;
  className?: string;
};

export function PurchaseTypeSelector({
  purchaseType,
  cadence,
  onPurchaseTypeChange,
  onCadenceChange,
  className,
}: PurchaseTypeSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="font-serif text-2xl text-green mb-2">How would you like to order?</h2>
        <p className="text-sm text-muted">
          Choose a one-time purchase or subscribe for automatic deliveries.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onPurchaseTypeChange("one_time")}
          className={cn(
            "border p-5 text-left transition-colors",
            purchaseType === "one_time"
              ? "border-terra bg-cream"
              : "border-green/10 bg-white hover:border-green/25"
          )}
          style={{ borderRadius: "2px" }}
        >
          <p className="label-caps text-terra">One-time</p>
          <p className="mt-2 font-serif text-xl text-green">Pay once</p>
          <p className="mt-2 text-sm text-muted">
            Single order with no recurring charges.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onPurchaseTypeChange("subscription")}
          className={cn(
            "border p-5 text-left transition-colors",
            purchaseType === "subscription"
              ? "border-terra bg-cream"
              : "border-green/10 bg-white hover:border-green/25"
          )}
          style={{ borderRadius: "2px" }}
        >
          <p className="label-caps text-terra">Subscribe</p>
          <p className="mt-2 font-serif text-xl text-green">Recurring ritual</p>
          <p className="mt-2 text-sm text-muted">
            Save 10% and get the same order on your schedule. Cancel anytime.
          </p>
        </button>
      </div>

      {purchaseType === "subscription" && (
        <div className="space-y-3 border border-green/10 bg-white p-5" style={{ borderRadius: "2px" }}>
          <p className="label-caps text-muted">Delivery frequency</p>
          <div className="space-y-2">
            {SUBSCRIPTION_CADENCES.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                  cadence === option.id
                    ? "border-terra bg-cream"
                    : "border-green/10 hover:border-green/25"
                )}
                style={{ borderRadius: "2px" }}
              >
                <input
                  type="radio"
                  name="subscription-cadence"
                  value={option.id}
                  checked={cadence === option.id}
                  onChange={() => onCadenceChange(option.id)}
                  className="mt-1 accent-terra"
                />
                <span>
                  <span className="block font-medium text-green">{option.label}</span>
                  <span className="block text-sm text-muted">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted">
            Your card is charged today for this order. Future boxes bill automatically on
            your schedule until you cancel in Square or contact us.
          </p>
        </div>
      )}
    </div>
  );
}
