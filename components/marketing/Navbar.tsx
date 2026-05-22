"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

const navLinks = [
  { label: "Collections", href: "#collections" },
  { label: "Our Ritual", href: "#ritual" },
  { label: "Scents", href: "#scents" },
  { label: "About", href: "#about" },
];

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-baseline">
      <span className="font-serif text-2xl italic text-terra">Ms</span>
      <span className={cn("font-serif text-2xl text-green", dark && "text-green-2")}>
        Vee
      </span>
      <span className={cn("font-serif text-2xl text-green", dark && "text-cream")}>
        {" "}
        Soaps
      </span>
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-green/10 bg-cream/85 backdrop-blur-md shadow-sm"
            : "bg-cream/50 backdrop-blur-sm"
        )}
      >
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="group transition-opacity hover:opacity-90">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="label-caps text-muted transition-colors duration-250 hover:text-green"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-green transition-colors duration-250 hover:text-terra"
              aria-label={`Cart, ${itemCount} items`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center bg-terra text-[10px] font-medium text-white"
                  style={{ borderRadius: "2px" }}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            <Link
              href="#collections"
              className="hidden items-center justify-center bg-terra px-4 py-2 text-xs label-caps text-white transition-colors duration-250 hover:bg-terra-2 md:inline-flex"
              style={{ borderRadius: 0 }}
            >
              Shop Now
            </Link>

            <button
              type="button"
              className="p-2 text-green transition-colors hover:text-terra md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </header>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-green-3/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

      {/* Mobile panel — slides in from right */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col bg-green-3 shadow-2xl transition-transform duration-300 ease-out md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between border-b border-cream/10 px-6 py-5">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Logo dark />
          </Link>
          <button
            type="button"
            className="p-2 text-cream transition-colors hover:text-gold"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <ul className="flex flex-1 flex-col gap-1 px-6 py-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block border-b border-cream/5 py-4 font-serif text-2xl font-light text-cream transition-colors hover:text-gold"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-cream/10 p-6">
          <Link
            href="#collections"
            onClick={() => setMobileOpen(false)}
            className="inline-flex w-full items-center justify-center bg-terra px-8 py-4 text-sm label-caps text-white transition-colors duration-250 hover:bg-terra-2"
            style={{ borderRadius: 0 }}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </>
  );
}
