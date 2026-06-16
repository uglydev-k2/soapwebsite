"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StoreSettings } from "@prisma/client";
import {
  adminInviteSchema,
  changePasswordSchema,
  storeSettingsSchema,
  type AdminInviteData,
  type StoreSettingsData,
} from "@/lib/validations";
import { cn } from "@/lib/utils";
import { formatListField } from "@/lib/list-field";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PushNotificationToggle } from "@/components/admin/PushNotificationToggle";

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface SettingsFormProps {
  settings: StoreSettings | null;
  admins: AdminUserRow[];
  className?: string;
}

export function SettingsForm({
  settings,
  admins: initialAdmins,
  className,
}: SettingsFormProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [admins, setAdmins] = useState(initialAdmins);
  const [savingStore, setSavingStore] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [inviting, setInviting] = useState(false);

  const storeForm = useForm<StoreSettingsData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: settings
      ? {
          name: settings.name,
          tagline: settings.tagline ?? "",
          email: settings.email,
          phone: settings.phone ?? "",
          address: settings.address ?? "",
          flatShippingRate: settings.flatShippingRate,
          freeShippingThreshold: settings.freeShippingThreshold,
          notifyNewOrder: settings.notifyNewOrder,
          notifyOrderShipped: settings.notifyOrderShipped,
          notifyLowStock: settings.notifyLowStock,
          notifyNewCustomer: settings.notifyNewCustomer,
          maintenanceMode: settings.maintenanceMode,
          featureCheckout: settings.featureCheckout,
          featureNewsletter: settings.featureNewsletter,
          bannedKeywords: formatListField(settings.bannedKeywords),
          allowedEmailDomains: formatListField(settings.allowedEmailDomains),
        }
      : undefined,
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const inviteForm = useForm<AdminInviteData>({
    resolver: zodResolver(adminInviteSchema),
    defaultValues: { email: "", name: "" },
  });

  const saveStore = async (data: StoreSettingsData) => {
    setSavingStore(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "store", ...data }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Failed to save settings", "error");
        return;
      }
      addToast("Store settings saved");
    } catch {
      addToast("Failed to save settings", "error");
    } finally {
      setSavingStore(false);
    }
  };

  const savePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setSavingPassword(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", ...data }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Failed to change password", "error");
        return;
      }
      addToast("Password updated");
      passwordForm.reset();
    } catch {
      addToast("Failed to change password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const sendInvite = async (data: AdminInviteData) => {
    setInviting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "invite", ...data }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Failed to send invite", "error");
        return;
      }
      addToast(`Invite sent to ${data.email}`);
      setAdmins((prev) => [
        ...prev,
        {
          id: `pending-${data.email}`,
          email: data.email,
          name: data.name,
          role: "EDITOR",
          createdAt: new Date().toISOString(),
        },
      ]);
      inviteForm.reset();
    } catch {
      addToast("Failed to send invite", "error");
    } finally {
      setInviting(false);
    }
  };

  const {
    register: registerStore,
    handleSubmit: handleStoreSubmit,
    formState: { errors: storeErrors },
  } = storeForm;

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = passwordForm;

  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    formState: { errors: inviteErrors },
  } = inviteForm;

  return (
    <div className={cn("grid gap-8 sm:gap-8 lg:grid-cols-2", className)}>
      <PushNotificationToggle className="lg:col-span-2" />
      <form
        onSubmit={handleStoreSubmit(saveStore)}
        className="admin-card space-y-5 sm:space-y-4 lg:col-span-2"
      >
        <h2 className="font-serif text-xl font-semibold text-green">Store Settings</h2>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <Input
            label="Store Name"
            {...registerStore("name")}
            error={storeErrors.name?.message}
          />
          <Input
            label="Tagline"
            {...registerStore("tagline")}
            error={storeErrors.tagline?.message}
          />
          <Input
            label="Contact Email"
            type="email"
            {...registerStore("email")}
            error={storeErrors.email?.message}
          />
          <Input
            label="Phone"
            {...registerStore("phone")}
            error={storeErrors.phone?.message}
          />
        </div>
        <div>
          <label className="label-caps mb-2 block text-muted">Address</label>
          <textarea
            {...registerStore("address")}
            rows={2}
            className="admin-input w-full resize-y"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Flat Shipping Rate ($)"
            type="number"
            step="0.01"
            {...registerStore("flatShippingRate")}
            error={storeErrors.flatShippingRate?.message}
          />
          <Input
            label="Free Shipping Threshold ($)"
            type="number"
            step="0.01"
            {...registerStore("freeShippingThreshold")}
            error={storeErrors.freeShippingThreshold?.message}
          />
        </div>
        <fieldset className="space-y-3 border-t border-green/10 pt-4">
          <legend className="label-caps text-muted">Email Notifications</legend>
          {(
            [
              ["notifyNewOrder", "New orders"],
              ["notifyOrderShipped", "Order shipped"],
              ["notifyLowStock", "Low stock alerts"],
              ["notifyNewCustomer", "New customers"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                {...registerStore(key)}
                className="h-4 w-4 accent-terra"
              />
              <span className="text-sm text-text">{label}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="space-y-3 border-t border-green/10 pt-4">
          <legend className="label-caps text-muted">Feature Flags</legend>
          {(
            [
              ["maintenanceMode", "Maintenance mode (blocks checkout)"],
              ["featureCheckout", "Enable checkout"],
              ["featureNewsletter", "Enable newsletter signup"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                {...registerStore(key)}
                className="h-4 w-4 accent-terra"
              />
              <span className="text-sm text-text">{label}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="space-y-3 border-t border-green/10 pt-4">
          <legend className="label-caps text-muted">Moderation & Access</legend>
          <div>
            <label className="label-caps mb-2 block text-muted">
              Banned keywords
            </label>
            <textarea
              {...registerStore("bannedKeywords")}
              rows={2}
              placeholder="spam, counterfeit, ..."
              className="admin-input w-full resize-y text-sm"
            />
            <p className="mt-1 text-xs text-muted">
              Comma-separated words flagged during product moderation.
            </p>
          </div>
          <div>
            <label className="label-caps mb-2 block text-muted">
              Allowed admin email domains
            </label>
            <textarea
              {...registerStore("allowedEmailDomains")}
              rows={2}
              placeholder="mvlusciouslather.com, yourcompany.com"
              className="admin-input w-full resize-y text-sm"
            />
            <p className="mt-1 text-xs text-muted">
              Leave empty to allow any domain for admin invites.
            </p>
          </div>
        </fieldset>
        <Button type="submit" disabled={savingStore}>
          {savingStore ? "Saving…" : "Save Store Settings"}
        </Button>
      </form>

      <form
        onSubmit={handlePasswordSubmit(savePassword)}
        className="admin-card space-y-4"
        id="account"
      >
        <h2 className="font-serif text-xl font-semibold text-green">Change Password</h2>
        <Input
          label="Current Password"
          type="password"
          autoComplete="current-password"
          {...registerPassword("currentPassword")}
          error={passwordErrors.currentPassword?.message}
        />
        <Input
          label="New Password"
          type="password"
          autoComplete="new-password"
          {...registerPassword("newPassword")}
          error={passwordErrors.newPassword?.message}
        />
        <Input
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          {...registerPassword("confirmPassword")}
          error={passwordErrors.confirmPassword?.message}
        />
        <Button type="submit" disabled={savingPassword}>
          {savingPassword ? "Updating…" : "Update Password"}
        </Button>
      </form>

      <div className="admin-card space-y-4">
        <h2 className="font-serif text-xl font-semibold text-green">Invite Admin</h2>
        <form onSubmit={handleInviteSubmit(sendInvite)} className="space-y-4">
          <Input
            label="Name"
            {...registerInvite("name")}
            error={inviteErrors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            {...registerInvite("email")}
            error={inviteErrors.email?.message}
          />
          <Button type="submit" disabled={inviting} className="w-full">
            {inviting ? "Sending…" : "Send Invite"}
          </Button>
        </form>

        <div className="border-t border-green/10 pt-4">
          <h3 className="label-caps mb-3 text-muted">Team Members</h3>
          <ul className="space-y-2">
            {admins.map((admin) => (
              <li
                key={admin.id}
                className="flex items-center justify-between border border-green/10 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-green">{admin.name}</p>
                  <p className="text-xs text-muted">{admin.email}</p>
                </div>
                <span className="label-caps text-gold">{admin.role.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
