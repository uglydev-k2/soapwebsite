"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { signupSchema } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { AuthSpinner } from "./AuthSpinner";
import { useToastStore } from "@/store/toastStore";

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      addToast(
        "Account created! Check your email to confirm your address.",
        "success"
      );
      router.push("/login");
    } catch {
      setError("Unable to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          variant="admin"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>
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
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          variant="admin"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          variant="admin"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>
      {error && <p className="text-terra text-sm">{error}</p>}
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading && <AuthSpinner />}
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
