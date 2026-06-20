"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@/lib/validations";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store/toastStore";

type FormData = z.infer<typeof profileUpdateSchema>;

export function AccountProfileForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { fullName: defaultName },
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      addToast(json.error ?? "Could not update profile", "error");
      return;
    }
    addToast("Profile updated");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Display name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        Save Profile
      </Button>
    </form>
  );
}
