import Link from "next/link";
import {
  BarChart3,
  Megaphone,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

const actions = [
  {
    label: "New Product",
    href: "/admin/products/new",
    icon: Plus,
    accent: "bg-terra text-white",
  },
  {
    label: "View Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    accent: "bg-green text-cream",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    accent: "bg-green-2 text-cream",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    accent: "bg-gold/20 text-green",
  },
  {
    label: "Broadcast",
    href: "/admin/notifications",
    icon: Megaphone,
    accent: "bg-green/10 text-green",
  },
  {
    label: "Inventory",
    href: "/admin/products",
    icon: Package,
    accent: "bg-cream-2 text-green",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    accent: "bg-cream text-green",
  },
];

export function DashboardQuickActions() {
  return (
    <div className="admin-card">
      <p className="label-caps mb-4 text-muted">Quick Actions</p>
      <div className="admin-actions-scroll gap-3 sm:gap-2">
        {actions.map((action) => (
          <Link
            key={action.href + action.label}
            href={action.href}
            className="inline-flex min-h-11 items-center gap-2.5 border border-green/10 bg-white px-4 py-3 text-sm text-green transition-all hover:border-green/25 hover:shadow-sm sm:px-3 sm:py-2.5 sm:text-xs"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center sm:h-6 sm:w-6 ${action.accent}`}
            >
              <action.icon size={14} />
            </span>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
