import { errorResponse, jsonResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { isUploadThingConfigured } from "@/lib/uploadthing-env";
import { auth } from "@/lib/auth";

export const GET = withApiHandler("admin.uploadStatus", async () => {
  const session = await auth();
  if (!session?.user) return errorResponse("Unauthorized", 401);
  return jsonResponse({ configured: isUploadThingConfigured() });
});
