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
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div
        className={`w-full max-w-md bg-white p-8 card-border ${shake ? "animate-shake" : ""}`}
      >
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-green">
            <span className="italic text-terra">Ms</span>
            <span>Vee</span>
            <span className="text-green text-2xl"> Soaps</span>
          </h1>
          <p className="label-caps text-muted mt-2">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email"
            type="email"
            variant="admin"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            variant="admin"
            error={errors.password?.message}
            {...register("password")}
          />
          {error && <p className="text-terra text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
