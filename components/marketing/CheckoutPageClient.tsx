"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { checkoutFormSchema, checkoutSchema, type CheckoutFormData } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { formatPrice } from "@/lib/utils";
import { AuthSpinner } from "@/components/auth/AuthSpinner";

const TAX_RATE = 0.08;
const FLAT_SHIPPING = 8;
const FREE_SHIPPING_THRESHOLD = 75;

export default function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");

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

  const totals = useMemo(() => {
    const sub = subtotal();
    const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    const tax = Math.round(sub * TAX_RATE * 100) / 100;
    return {
      subtotal: sub,
      shipping,
      tax,
      total: Math.round((sub + shipping + tax) * 100) / 100,
    };
  }, [subtotal]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      country: "Ghana",
    },
  });

  useEffect(() => {
    if (prefillEmail) setValue("email", prefillEmail);
  }, [prefillEmail, setValue]);

  useEffect(() => {
    if (!items.length) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          slug: item.slug,
          image: item.image,
        })),
      };

      const parsed = checkoutSchema.safeParse(payload);
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

      if (!res.ok || !json.data?.url) {
        addToast(json.error || "Checkout failed", "error");
        setLoading(false);
        return;
      }

      window.location.href = json.data.url;
    } catch {
      addToast("Checkout failed", "error");
      setLoading(false);
    }
  };

  if (!items.length) return null;

  return (
    <section className="pt-32 pb-24 px-6 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/cart"
          className="label-caps text-muted hover:text-green transition-colors mb-8 inline-block"
        >
          ← Back to cart
        </Link>
        <h1 className="font-serif text-4xl font-light text-green mb-12">Checkout</h1>

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
              <h2 className="font-serif text-2xl text-green mb-6">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
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
                <Input
                  label="State / Region"
                  variant="marketing"
                  error={errors.state?.message}
                  {...register("state")}
                />
                <Input
                  label="Postal code"
                  variant="marketing"
                  error={errors.postalCode?.message}
                  {...register("postalCode")}
                />
                <div>
                  <Label htmlFor="country" className="mb-2 block">
                    Country
                  </Label>
                  <select
                    id="country"
                    className="admin-input w-full"
                    {...register("country")}
                  >
                    <option value="Ghana">Ghana</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-terra">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card-border bg-white p-6 h-fit">
            <h2 className="label-caps text-muted mb-6">Order Summary</h2>
            <ul className="space-y-3 mb-6 text-sm">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between gap-4">
                  <span className="text-muted">
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 text-sm mb-6 border-t border-green/10 pt-4">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>
                  {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
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
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <AuthSpinner />}
              {loading ? "Redirecting…" : "Pay with Stripe"}
            </Button>
            <p className="mt-3 text-xs text-muted text-center">
              Secure payment via Stripe. Paystack support coming soon for Ghana.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
