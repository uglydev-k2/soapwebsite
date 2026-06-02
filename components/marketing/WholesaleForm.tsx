"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wholesaleSchema } from "@/lib/validations";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type FormData = z.infer<typeof wholesaleSchema>;

export function WholesaleForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(wholesaleSchema) });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/wholesale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="subheading border border-green/10 bg-white p-8 text-center text-xl">
        Thank you — our team will review your inquiry shortly.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 border border-green/10 bg-white p-8"
      style={{ borderRadius: "2px" }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Business name" error={errors.businessName?.message} {...register("businessName")} />
        <Input label="Contact name" error={errors.contactName?.message} {...register("contactName")} />
      </div>
      <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input label="Website (optional)" {...register("website")} />
      <label className="block space-y-2">
        <span className="label-caps text-muted">Tell us about your needs</span>
        <textarea rows={5} className="input-admin w-full resize-y" {...register("message")} />
        {errors.message && <span className="text-sm text-terra">{errors.message.message}</span>}
      </label>
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        Submit inquiry
      </Button>
    </form>
  );
}
