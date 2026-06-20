"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSubmitSchema } from "@/lib/validations";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store/toastStore";

type FormData = z.infer<typeof reviewSubmitSchema>;

export function ReviewSubmitForm({ productSlug }: { productSlug: string }) {
  const addToast = useToastStore((s) => s.addToast);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(reviewSubmitSchema),
    defaultValues: {
      productSlug,
      authorName: "",
      title: "",
      body: "",
      rating: 5,
    },
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      addToast(json.error ?? "Could not submit review", "error");
      return;
    }
    setDone(true);
    addToast(json.data?.message ?? "Review submitted");
  };

  if (done) {
    return (
      <p className="mt-8 text-sm text-muted">
        Thank you — your review is pending moderation and will appear soon.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 border border-green/10 bg-white p-6"
      style={{ borderRadius: "2px" }}
    >
      <p className="label-caps text-terra">Write a Review</p>
      <input type="hidden" {...register("productSlug")} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          placeholder="Your name"
          error={errors.authorName?.message}
          {...register("authorName")}
        />
        <div>
          <label className="label-caps mb-2 block text-muted">Rating</label>
          <select
            className="admin-input w-full"
            {...register("rating", { valueAsNumber: true })}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <Input placeholder="Review title" error={errors.title?.message} {...register("title")} />
      </div>
      <div className="mt-4">
        <textarea
          className="admin-input min-h-28 w-full"
          placeholder="Share your experience with this product"
          {...register("body")}
        />
        {errors.body?.message && (
          <p className="mt-1 text-xs text-terra">{errors.body.message}</p>
        )}
      </div>
      <Button type="submit" variant="primary" className="mt-4" disabled={isSubmitting}>
        Submit Review
      </Button>
    </form>
  );
}
