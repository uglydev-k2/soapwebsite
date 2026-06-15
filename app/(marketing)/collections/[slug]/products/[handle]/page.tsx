import { redirect } from "next/navigation";
import { resolveShopifyProductHandle } from "@/lib/shopify-redirects";

export const dynamic = "force-dynamic";

/** Legacy Shopify nested product URLs → /collections/{slug} */
export default async function LegacyShopifyNestedProductPage({
  params,
}: {
  params: { slug: string; handle: string };
}) {
  const productSlug = await resolveShopifyProductHandle(params.handle);
  if (productSlug) {
    redirect(`/collections/${productSlug}`);
  }
  redirect("/collections");
}
