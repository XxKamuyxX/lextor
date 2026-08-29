import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linkClienteSession } from "@/lib/acesso";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cliente = await linkClienteSession(supabase, user);

      if (!cliente) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=nao_autorizado`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
