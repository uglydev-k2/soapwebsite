"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { newsletterSchema } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type NewsletterForm = z.infer<typeof newsletterSchema>;

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: NewsletterForm) => {
    setServerError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      reset();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="bg-terra py-20 lg:py-24">
      <ScrollReveal className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <span className="label-caps text-cream/70">Stay Connected</span>
        <h2 className="mt-4 font-serif text-4xl font-semibold text-cream lg:text-5xl">
          Join the Ritual
        </h2>
        <p className="mt-4 text-cream/90">
          Be the first to know about new scents, seasonal collections, and
          exclusive offers. No spam — just botanical goodness.
        </p>

        {submitted ? (
          <div
            className="mt-10 border border-cream/20 bg-cream/10 px-8 py-6"
            style={{ borderRadius: "2px" }}
          >
            <p className="font-serif text-xl text-cream">
              Welcome to the MsVee family.
            </p>
            <p className="mt-2 text-sm text-cream/70">
              Check your inbox for a warm welcome from us.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-start"
            noValidate
          >
            <div className="flex-1">
              <Input
                type="email"
                placeholder="your@email.com"
                disabled={isSubmitting}
                className={cn(
                  "border-cream/30 bg-cream/10 text-cream placeholder:text-cream/50",
                  "focus:border-cream focus:ring-0"
                )}
                aria-label="Email address"
                error={errors.email?.message ?? serverError}
                {...register("email")}
              />
            </div>
            <Button
              type="submit"
              variant="ghost"
              size="lg"
              disabled={isSubmitting}
              className="shrink-0 border-cream/40 text-cream hover:border-cream hover:bg-cream/10"
            >
              {isSubmitting ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
        )}
      </ScrollReveal>
    </section>
  );
}
