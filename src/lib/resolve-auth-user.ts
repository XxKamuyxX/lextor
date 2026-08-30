import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

export async function resolveAuthUser(
  request: Request
): Promise<User | null> {
  const authHeader = request.headers.get("authorization");
  const admin = createAdminClient();

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data, error } = await admin.auth.getUser(token);
      if (!error && data.user) return data.user;
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}
