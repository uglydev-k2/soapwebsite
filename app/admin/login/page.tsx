"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { z } from "zod";
import Link from "next/link";
import { Shield } from "lucide-react";

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center px-5 py-12 supports-[padding:max(0px)]:pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,138,74,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(31,52,44,0.06),transparent_35%)]" />

      <div
        className={`relative w-full max-w-md border border-green/10 bg-white p-8 shadow-xl sm:p-8 ${shake ? "animate-shake" : ""}`}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-green-3 text-gold">
            <Shield size={22} />
          </div>
          <h1 className="font-serif text-3xl text-green">
            <span className="italic text-terra">Ms</span>
            <span>Vee</span>
          </h1>
          <p className="label-caps mt-2 text-muted">Admin Command Center</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            autoComplete="username"
            variant="admin"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            variant="admin"
            error={errors.password?.message}
            {...register("password")}
          />
          {error && (
            <p className="border border-terra/20 bg-terra/5 px-3 py-2 text-sm text-terra">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in to dashboard"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="text-green hover:text-terra">
            ← Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
