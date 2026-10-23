import { brandTitle } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("/cart", {
  title: brandTitle("Cart"),
  robots: { index: false, follow: false },
});

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
