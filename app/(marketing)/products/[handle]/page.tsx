import { redirect } from "next/navigation";
import { resolveShopifyProductHandle } from "@/lib/shopify-redirects";

export const dynamic = "force-dynamic";

/** Legacy Shopify product URLs → /collections/{slug} */
export default async function LegacyShopifyProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const slug = await resolveShopifyProductHandle(params.handle);
  if (slug) {
    redirect(`/collections/${slug}`);
  }
  redirect("/collections");
}
