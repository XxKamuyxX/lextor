import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAccessTokenFromBrowser(supabase: SupabaseClient) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export function authHeaders(accessToken: string | null | undefined) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}
