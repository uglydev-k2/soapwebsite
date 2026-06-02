"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockNotifySchema } from "@/lib/validations";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type FormData = z.infer<typeof stockNotifySchema>;

export function StockNotifyForm({
  productSlug,
  productName,
}: {
  productSlug: string;
  productName: string;
}) {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(stockNotifySchema),
    defaultValues: { productSlug, productName, email: "" },
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/stock-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setDone(true);
  };

  if (done) {
    return (
      <p className="text-sm text-green">
        You&apos;re on the list — we&apos;ll email you when {productName} is back.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row">
      <input type="hidden" {...register("productSlug")} />
      <input type="hidden" {...register("productName")} />
      <Input
        type="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        className="flex-1"
        {...register("email")}
      />
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        Notify Me
      </Button>
    </form>
  );
}
