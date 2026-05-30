"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, magicLinkSchema } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { AuthSpinner } from "./AuthSpinner";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { cn } from "@/lib/utils";
import Link from "next/link";

type LoginForm = z.infer<typeof loginSchema>;
type MagicLinkForm = z.infer<typeof magicLinkSchema>;

type Tab = "password" | "magic";

export function LoginForm({
  showGoogle,
}: {
  showGoogle: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("password");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const magicForm = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
  });

  const onPasswordSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch {
      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  };

  const onMagicSubmit = async (data: MagicLinkForm) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSuccess("Check your email for a magic link to sign in.");
      setLoading(false);
    } catch {
      setError("Unable to send magic link. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-green/10">
        <button
          type="button"
          onClick={() => {
            setTab("password");
            setError("");
            setSuccess("");
          }}
          className={cn(
            "flex-1 pb-3 label-caps transition-colors duration-250",
            tab === "password"
              ? "text-green border-b-2 border-terra"
              : "text-muted hover:text-green"
          )}
        >
          Email & Password
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("magic");
            setError("");
            setSuccess("");
          }}
          className={cn(
            "flex-1 pb-3 label-caps transition-colors duration-250",
            tab === "magic"
              ? "text-green border-b-2 border-terra"
              : "text-muted hover:text-green"
          )}
        >
          Magic Link
        </button>
      </div>

      {tab === "password" ? (
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              variant="admin"
              autoComplete="email"
              error={passwordForm.formState.errors.email?.message}
              {...passwordForm.register("email")}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password" className="mb-0">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-terra hover:text-terra-2 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              variant="admin"
              autoComplete="current-password"
              error={passwordForm.formState.errors.password?.message}
              {...passwordForm.register("password")}
            />
          </div>
          {error && <p className="text-terra text-sm">{error}</p>}
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <AuthSpinner />}
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={magicForm.handleSubmit(onMagicSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="magic-email">Email</Label>
            <Input
              id="magic-email"
              type="email"
              variant="admin"
              autoComplete="email"
              placeholder="you@example.com"
              error={magicForm.formState.errors.email?.message}
              {...magicForm.register("email")}
            />
          </div>
          <p className="text-sm text-muted">
            We&apos;ll email you a secure link — no password needed.
          </p>
          {error && <p className="text-terra text-sm">{error}</p>}
          {success && <p className="text-green text-sm">{success}</p>}
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <AuthSpinner />}
            {loading ? "Sending link..." : "Send Magic Link"}
          </Button>
        </form>
      )}

      {showGoogle && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-green/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted label-caps">or</span>
            </div>
          </div>
          <GoogleSignInButton />
        </>
      )}
    </div>
  );
}
