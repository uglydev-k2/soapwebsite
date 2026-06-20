import { createClient } from "@/lib/supabase/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { profileUpdateSchema } from "@/lib/validations";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return errorResponse("Account profiles are unavailable", 503);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid profile data");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName.trim() })
    .eq("id", user.id);

  if (error) {
    return errorResponse("Could not update profile");
  }

  return jsonResponse({
    success: true,
    profile: {
      id: user.id,
      email: user.email,
      full_name: parsed.data.fullName.trim(),
    },
  });
}
