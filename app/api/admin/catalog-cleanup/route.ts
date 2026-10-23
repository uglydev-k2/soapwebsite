import { jsonResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { fixProductCatalogData } from "@/lib/fix-product-catalog-data";
import { isDatabaseConfigured } from "@/lib/env";

export const POST = withApiHandler("admin.catalog-cleanup", async () => {
  const { error } = await requireAdmin("products:write");
  if (error) return error;

  if (!isDatabaseConfigured()) {
    return errorResponse("Database not configured", 503);
  }

  const result = await fixProductCatalogData();
  return jsonResponse(result);
});
