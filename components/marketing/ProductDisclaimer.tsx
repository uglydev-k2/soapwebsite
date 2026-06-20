import Link from "next/link";
import { PRODUCT_DISCLAIMER_SHORT } from "@/lib/content/disclaimer";

export function ProductDisclaimer() {
  return (
    <div
      className="mt-8 border border-green/10 bg-cream-2 p-4 text-xs leading-relaxed text-muted"
      style={{ borderRadius: "2px" }}
    >
      <p className="label-caps text-green">Important</p>
      <p className="mt-2">{PRODUCT_DISCLAIMER_SHORT}</p>
      <Link href="/disclaimer" className="mt-2 inline-block text-green hover:text-terra">
        Read full disclaimer →
      </Link>
    </div>
  );
}
