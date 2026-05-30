"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { AuthSpinner } from "./AuthSpinner";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSuccess("Check your email for a password reset link.");
      setLoading(false);
    } catch {
      setError("Unable to send reset email. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          variant="admin"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
      <p className="text-sm text-muted">
        Enter the email associated with your account and we&apos;ll send a reset
        link.
      </p>
      {error && <p className="text-terra text-sm">{error}</p>}
      {success && <p className="text-green text-sm">{success}</p>}
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading && <AuthSpinner />}
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
