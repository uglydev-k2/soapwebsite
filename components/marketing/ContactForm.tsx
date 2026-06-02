"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validations";
import type { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      reset();
    } catch {
      setServerError("Could not send your message. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="border border-green/10 bg-white p-8 text-center">
        <p className="subheading text-2xl">Message sent</p>
        <p className="mt-3 text-sm text-muted">
          Thank you — we will reply within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 border border-green/10 bg-white p-8"
      style={{ borderRadius: "2px" }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Name" error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
      </div>
      <Input label="Subject" error={errors.subject?.message} {...register("subject")} />
      <label className="block space-y-2">
        <span className="label-caps text-muted">Message</span>
        <textarea
          rows={5}
          className="input-admin w-full resize-y"
          {...register("message")}
        />
        {errors.message && (
          <span className="text-sm text-terra">{errors.message.message}</span>
        )}
      </label>
      {serverError && <p className="text-sm text-terra">{serverError}</p>}
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
