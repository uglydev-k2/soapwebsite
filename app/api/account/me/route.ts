import { getNavbarAuthUser } from "@/lib/profile";
import { jsonResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getNavbarAuthUser();
  return jsonResponse(user);
}
