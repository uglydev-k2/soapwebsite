"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { checkoutFormSchema, checkoutPaymentSchema, type CheckoutFormData } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { formatPrice } from "@/lib/utils";
import { getBundleLineTotal } from "@/lib/bundle-pricing";
import { AuthSpinner } from "@/components/auth/AuthSpinner";
import {
  calculateCartTotals,
  SHIPPING_COUNTRIES,
  US_COUNTRY_CODE,
  US_STATES,
  isUsCountry,
} from "@/lib/shipping";
import {
  SquarePaymentForm,
  type SquarePaymentFormHandle,
} from "@/components/marketing/SquarePaymentForm";
import { PurchaseTypeSelector } from "@/components/marketing/PurchaseTypeSelector";
import {
  SUBSCRIPTION_DISCOUNT_RATE,
  applySubscriptionDiscount,
  type PurchaseType,
  type SubscriptionCadence,
} from "@/lib/subscriptions";
import type { ShippingQuote } from "@/lib/shipping-calculator";
import { PromoCodeField } from "@/components/marketing/PromoCodeField";
import { FREE_SAMPLE_PROMO } from "@/lib/shipping";

export default function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const squareRef = useRef<SquarePaymentFormHandle>(null);
  const [loading, setLoading] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one_time");
  const [subscriptionCadence, setSubscriptionCadence] =
    useState<SubscriptionCadence>("monthly");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState<string | undefined>();

  useEffect(() => {
    if (searchParams.get("cancelled") === "true") {
      addToast("Checkout was cancelled", "error");
    }
  }, [searchParams, addToast]);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.email) setPrefillEmail(json.data.email);
      })
      .catch(() => {});
  }, []);

  const sub = subtotal();
  const subAfterPromo = Math.max(0, Math.round((sub - promoDiscount) * 100) / 100);
  const discountedSubtotal = applySubscriptionDiscount(subAfterPromo, purchaseType);
  const subscriptionSavings =
    purchaseType === "subscription" ? subAfterPromo - discountedSubtotal : 0;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      country: US_COUNTRY_CODE,
      state: "",
    },
  });

  const watchedCountry = watch("country");
  const watchedState = watch("state");
  const watchedPostal = watch("postalCode");
  const isDomestic = isUsCountry(watchedCountry);

  useEffect(() => {
    if (prefillEmail) setValue("email", prefillEmail);
  }, [prefillEmail, setValue]);

  useEffect(() => {
    if (!items.length) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  useEffect(() => {
    if (!items.length) return;

    const needsState = isUsCountry(watchedCountry);
    if (needsState && !watchedState?.trim()) {
      setShippingQuote(null);
      return;
    }

    const timer = setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const res = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal: discountedSubtotal,
            country: watchedCountry,
            state: watchedState,
            postalCode: watchedPostal,
          }),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setShippingQuote(json.data as ShippingQuote);
        }
      } catch {
        setShippingQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [items, discountedSubtotal, watchedCountry, watchedState, watchedPostal]);

  const totals = useMemo(
    () => calculateCartTotals(discountedSubtotal, shippingQuote?.shipping),
    [discountedSubtotal, shippingQuote?.shipping]
  );

  const onSubmit = async (data: CheckoutFormData) => {
    if (!squareRef.current?.isReady) {
      addToast("Payment form is still loading. Please wait a moment.", "error");
      return;
    }

    if (!shippingQuote) {
      addToast("Enter your shipping address to calculate delivery.", "error");
      return;
    }

    setLoading(true);
    try {
      let sourceId: string;
      try {
        const token = await squareRef.current.tokenize();
        if (!token) {
          addToast("Please enter valid card details.", "error");
          setLoading(false);
          return;
        }
        sourceId = token;
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Card verification failed.",
          "error"
        );
        setLoading(false);
        return;
      }

      const payload = {
        ...data,
        sourceId,
        idempotencyKey: crypto.randomUUID(),
        purchaseType,
        subscriptionCadence:
          purchaseType === "subscription" ? subscriptionCadence : undefined,
        promoCode,
        items: items.map((item) => ({
          productId: item.productId,
          scentOptionId: item.scentOptionId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          slug: item.slug,
          image: item.image,
        })),
      };

      const parsed = checkoutPaymentSchema.safeParse(payload);
      if (!parsed.success) {
        addToast(parsed.error.errors[0]?.message || "Invalid checkout data", "error");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();

      if (!res.ok || !json.data?.paymentId) {
        addToast(json.error || "Checkout failed", "error");
        setLoading(false);
        return;
      }

      router.push(
        `/order/confirmation?payment_id=${encodeURIComponent(json.data.paymentId)}`
      );
    } catch {
      addToast("Checkout failed", "error");
      setLoading(false);
    }
  };

  if (!items.length) return null;

  return (
    <section className="marketing-header-offset min-h-screen bg-cream px-4 pb-24 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/cart"
          className="label-caps text-muted hover:text-green transition-colors mb-8 inline-block"
        >
          ← Back to cart
        </Link>
        <h1 className="font-serif text-4xl font-semibold text-green mb-12">Checkout</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-12"
        >
          <div className="lg:col-span-2 space-y-8">
            <div className="card-border bg-white p-6">
              <h2 className="font-serif text-2xl text-green mb-6">Contact</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Email"
                    type="email"
                    variant="marketing"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>
                <Input
                  label="First Name"
                  variant="marketing"
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />
                <Input
                  label="Last Name"
                  variant="marketing"
                  error={errors.lastName?.message}
                  {...register("lastName")}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Phone (optional)"
                    variant="marketing"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                </div>
              </div>
            </div>

            <div className="card-border bg-white p-6">
              <PurchaseTypeSelector
                purchaseType={purchaseType}
                cadence={subscriptionCadence}
                onPurchaseTypeChange={setPurchaseType}
                onCadenceChange={setSubscriptionCadence}
              />
            </div>

            <div className="card-border bg-white p-6">
              <h2 className="font-serif text-2xl text-green mb-2">Shipping Address</h2>
              <p className="mb-6 text-sm text-muted">
                USPS rates calculated by weight and destination at checkout.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="country" className="mb-2 block">
                    Country
                  </Label>
                  <select
                    id="country"
                    className="admin-input w-full"
                    {...register("country")}
                  >
                    {SHIPPING_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-terra">{errors.country.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Address line 1"
                    variant="marketing"
                    error={errors.line1?.message}
                    {...register("line1")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Address line 2 (optional)"
                    variant="marketing"
                    error={errors.line2?.message}
                    {...register("line2")}
                  />
                </div>
                <Input
                  label="City"
                  variant="marketing"
                  error={errors.city?.message}
                  {...register("city")}
                />
                {isDomestic ? (
                  <div>
                    <Label htmlFor="state" className="mb-2 block">
                      State
                    </Label>
                    <select
                      id="state"
                      className="admin-input w-full"
                      defaultValue=""
                      {...register("state")}
                    >
                      <option value="" disabled>
                        Select state
                      </option>
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="mt-1 text-sm text-terra">{errors.state.message}</p>
                    )}
                  </div>
                ) : (
                  <Input
                    label="State / Province (optional)"
                    variant="marketing"
                    error={errors.state?.message}
                    {...register("state")}
                  />
                )}
                <Input
                  label={isDomestic ? "ZIP code" : "Postal code"}
                  variant="marketing"
                  error={errors.postalCode?.message}
                  {...register("postalCode")}
                />
              </div>
            </div>

            <SquarePaymentForm ref={squareRef} />
          </div>

          <div className="card-border bg-white p-6 h-fit">
            <h2 className="label-caps text-muted mb-6">Order Summary</h2>
            <ul className="space-y-3 mb-6 text-sm">
              {items.map((item) => (
                <li
                  key={`${item.productId}:${item.scentOptionId ?? ""}`}
                  className="flex justify-between gap-4"
                >
                  <span className="text-muted">
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(getBundleLineTotal(item.price, item.quantity))}</span>
                </li>
              ))}
            </ul>
            <PromoCodeField
              subtotal={sub}
              onApplied={(discount, code) => {
                setPromoDiscount(discount);
                setPromoCode(code);
              }}
              onClear={() => {
                setPromoDiscount(0);
                setPromoCode(undefined);
              }}
            />
            {shippingQuote && (
              <p className="mb-4 text-xs text-muted">
                Est. {shippingQuote.weightOz} oz · {shippingQuote.method}
                {shippingQuote.zone ? ` · Zone ${shippingQuote.zone}` : ""}
              </p>
            )}
            <div className="space-y-2 text-sm mb-6 border-t border-green/10 pt-4">
              <div className="flex justify-between">
                <span className="text-muted">Merchandise</span>
                <span>{formatPrice(sub)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-terra">
                  <span>Promo ({promoCode})</span>
                  <span>-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              {subscriptionSavings > 0 && (
                <div className="flex justify-between text-terra">
                  <span>Subscription savings ({Math.round(SUBSCRIPTION_DISCOUNT_RATE * 100)}%)</span>
                  <span>-{formatPrice(subscriptionSavings)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>
                  {quoteLoading
                    ? "Calculating…"
                    : shippingQuote
                      ? shippingQuote.shipping === 0
                        ? "Free"
                        : formatPrice(shippingQuote.shipping)
                      : isDomestic
                        ? "Select state"
                        : "Enter address"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
                <span>{formatPrice(totals.tax)}</span>
              </div>
              <div className="flex justify-between font-serif text-lg text-green pt-2">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loading || quoteLoading || !shippingQuote}
            >
              {loading && <AuthSpinner />}
              {loading
                ? "Processing…"
                : purchaseType === "subscription"
                  ? `Subscribe & pay ${formatPrice(totals.total)}`
                  : `Pay ${formatPrice(totals.total)}`}
            </Button>
            <p className="mt-3 text-xs text-muted text-center">
              {FREE_SAMPLE_PROMO} ·{" "}
              {purchaseType === "subscription"
                ? "Secure payment via Square · Recurring billing on your schedule"
                : "Secure payment via Square · Ships via USPS"}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
