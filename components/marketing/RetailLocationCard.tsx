import Link from "next/link";
import {
  formatRetailAddressSingleLine,
  formatRetailLocationTitle,
  RETAIL_LOCATION,
  retailLocationGoogleMapsUrl,
} from "@/lib/retail-location";

type RetailLocationCardProps = {
  variant?: "light" | "dark";
};

export function RetailLocationCard({ variant = "light" }: RetailLocationCardProps) {
  const isDark = variant === "dark";
  const boxClass = isDark
    ? "border-cream/15 bg-cream/5 text-cream"
    : "border-green/10 bg-white text-green";
  const mutedClass = isDark ? "text-cream/75" : "text-muted";
  const linkClass = isDark
    ? "text-gold hover:text-cream"
    : "text-green hover:text-terra";

  return (
    <div className={`border p-6 ${boxClass}`} style={{ borderRadius: "2px" }}>
      <p className={`label-caps ${mutedClass}`}>Shop in person</p>
      <p className={`mt-2 font-serif text-xl ${isDark ? "text-cream" : "text-green"}`}>
        {formatRetailLocationTitle()}
      </p>
      <address className={`mt-3 not-italic text-sm leading-relaxed ${mutedClass}`}>
        {RETAIL_LOCATION.streetAddress}
        <br />
        {RETAIL_LOCATION.city}, {RETAIL_LOCATION.state} {RETAIL_LOCATION.postalCode}
      </address>
      <p className={`mt-3 text-sm ${mutedClass}`}>{RETAIL_LOCATION.hoursLabel}</p>
      <Link
        href={retailLocationGoogleMapsUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className={`label-caps mt-4 inline-block text-sm ${linkClass}`}
      >
        Get directions →
      </Link>
      <span className="sr-only">{formatRetailAddressSingleLine()}</span>
    </div>
  );
}
