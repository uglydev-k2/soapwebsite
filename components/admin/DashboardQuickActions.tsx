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
    <div className="admin-card p-4">
      <p className="label-caps mb-3 text-muted">Quick Actions</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.href + action.label}
            href={action.href}
            className="inline-flex items-center gap-2 border border-green/10 bg-white px-3 py-2 text-xs text-green transition-all hover:border-green/25 hover:shadow-sm"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center ${action.accent}`}
            >
              <action.icon size={13} />
            </span>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
