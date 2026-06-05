import { errorResponse, jsonResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import {
  getUploadThingToken,
  isUploadThingConfigured,
} from "@/lib/uploadthing-env";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = withApiHandler("admin.uploadStatus", async () => {
  const session = await auth();
  if (!session?.user) return errorResponse("Unauthorized", 401);

  const token = getUploadThingToken();
  return jsonResponse({
    configured: isUploadThingConfigured(),
    tokenLength: token?.length ?? 0,
  });
});
