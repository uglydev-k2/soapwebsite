import type { Role } from "@prisma/client";

export type AdminRole = Role;

/** Normalized roles — EDITOR is treated as ADMIN for backward compatibility */
export function normalizeRole(role: string | undefined): AdminRole {
  if (role === "EDITOR") return "ADMIN";
  if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MODERATOR") {
    return role;
  }
  return "MODERATOR";
}

export type Permission =
  | "dashboard:read"
  | "analytics:read"
  | "products:read"
  | "products:write"
  | "products:delete"
  | "orders:read"
  | "orders:write"
  | "orders:refund"
  | "customers:read"
  | "customers:write"
  | "customers:ban"
  | "customers:delete"
  | "billing:read"
  | "billing:write"
  | "content:read"
  | "content:moderate"
  | "notifications:write"
  | "settings:read"
  | "settings:write"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "logs:read";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard:read",
    "analytics:read",
    "products:read",
    "products:write",
    "products:delete",
    "orders:read",
    "orders:write",
    "orders:refund",
    "customers:read",
    "customers:write",
    "customers:ban",
    "customers:delete",
    "billing:read",
    "billing:write",
    "content:read",
    "content:moderate",
    "notifications:write",
    "settings:read",
    "settings:write",
    "users:read",
    "users:write",
    "users:delete",
    "logs:read",
  ],
  ADMIN: [
    "dashboard:read",
    "analytics:read",
    "products:read",
    "products:write",
    "products:delete",
    "orders:read",
    "orders:write",
    "orders:refund",
    "customers:read",
    "customers:write",
    "customers:ban",
    "billing:read",
    "billing:write",
    "content:read",
    "content:moderate",
    "notifications:write",
    "settings:read",
    "settings:write",
    "users:read",
    "logs:read",
  ],
  MODERATOR: [
    "dashboard:read",
    "products:read",
    "orders:read",
    "customers:read",
    "content:read",
    "content:moderate",
    "logs:read",
  ],
  EDITOR: [],
};

ROLE_PERMISSIONS.EDITOR = ROLE_PERMISSIONS.ADMIN;

export function hasPermission(
  role: string | undefined,
  permission: Permission
): boolean {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized]?.includes(permission) ?? false;
}

export function canAccessAdmin(role: string | undefined): boolean {
  return hasPermission(role, "dashboard:read");
}

/** Map Supabase profiles.role → Prisma admin RBAC role */
export function mapSupabaseProfileRole(
  profileRole: string | undefined | null
): AdminRole | null {
  if (!profileRole) return null;
  const normalized = profileRole.toLowerCase().trim();
  if (normalized === "superadmin" || normalized === "super_admin") {
    return "SUPER_ADMIN";
  }
  if (normalized === "admin") return "ADMIN";
  if (normalized === "moderator") return "MODERATOR";
  return null;
}

export function isSupabaseProfileAdmin(
  profileRole: string | undefined | null
): boolean {
  const mapped = mapSupabaseProfileRole(profileRole);
  return mapped !== null && canAccessAdmin(mapped);
}

/** Route → minimum permission */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/admin": "dashboard:read",
  "/admin/system": "dashboard:read",
  "/admin/analytics": "analytics:read",
  "/admin/products": "products:read",
  "/admin/inventory": "products:read",
  "/admin/orders": "orders:read",
  "/admin/customers": "customers:read",
  "/admin/users": "users:read",
  "/admin/billing": "billing:read",
  "/admin/subscriptions": "billing:read",
  "/admin/content": "content:read",
  "/admin/reviews": "content:read",
  "/admin/promo-codes": "settings:read",
  "/admin/notifications": "notifications:write",
  "/admin/settings": "settings:read",
  "/admin/logs": "logs:read",
};

export function getRequiredPermission(pathname: string): Permission | null {
  const sorted = Object.keys(ROUTE_PERMISSIONS).sort(
    (a, b) => b.length - a.length
  );
  for (const route of sorted) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return ROUTE_PERMISSIONS[route];
    }
  }
  return null;
}

export function roleLabel(role: string | undefined): string {
  return normalizeRole(role).replace(/_/g, " ");
}
