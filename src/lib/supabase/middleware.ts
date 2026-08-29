import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAcessoLiberado, fetchClienteByEmail } from "@/lib/acesso";

const AUTH_PATHS = ["/dashboard", "/onboarding", "/preferencias", "/app"];

function isProtectedPath(pathname: string) {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

async function usuarioTemAcesso(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string | null }
) {
  if (!user.email) return false;

  const byUser = await supabase
    .from("clientes")
    .select("id, acesso_liberado")
    .eq("user_id", user.id)
    .maybeSingle();

  if (byUser.data) return isAcessoLiberado(byUser.data);

  const cliente = await fetchClienteByEmail(supabase, user.email);
  return isAcessoLiberado(cliente);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login";

  // Magic Link às vezes cai na Site URL (/) com ?code= — redireciona pro callback
  const authCode = request.nextUrl.searchParams.get("code");
  if (authCode && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!url.searchParams.has("next")) {
      url.searchParams.set("next", "/dashboard");
    }
    return NextResponse.redirect(url);
  }

  if (isProtectedPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (isProtectedPath(pathname) || isLoginRoute)) {
    const temAcesso = await usuarioTemAcesso(supabase, user);

    if (!temAcesso) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("error", "nao_autorizado");
      return NextResponse.redirect(url);
    }
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname === "/app" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
