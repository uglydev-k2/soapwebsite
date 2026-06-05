import { errorResponse, jsonResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = withApiHandler("admin.uploadStatus", async () => {
  const session = await auth();
  if (!session?.user) return errorResponse("Unauthorized", 401);
  return jsonResponse({ configured: isSupabaseConfigured(), provider: "supabase" });
});
