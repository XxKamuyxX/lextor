import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAcessoLiberado, fetchClienteByEmail } from "@/lib/acesso";
import { hasPerfilSuitability, mustChangePassword } from "@/lib/auth-guards";

const AUTH_PATHS = [
  "/dashboard",
  "/onboarding",
  "/preferencias",
  "/app",
  "/alterar-senha",
];

function isProtectedPath(pathname: string) {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

async function usuarioTemAcesso(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string | null }
) {
  const email = user.email?.trim();

  // SECURITY DEFINER — não depende de RLS na tabela clientes
  if (email) {
    const { data: viaRpc, error: rpcError } = await supabase.rpc(
      "verificar_acesso_membro",
      { p_email: email }
    );
    if (!rpcError && viaRpc === true) return true;
  }

  const byUser = await supabase
    .from("clientes")
    .select("id, acesso_liberado, perfil_suitability")
    .eq("user_id", user.id)
    .maybeSingle();

  if (byUser.data) return isAcessoLiberado(byUser.data);

  if (!email) return false;

  const cliente = await fetchClienteByEmail(supabase, email);
  return isAcessoLiberado(cliente);
}

async function getClienteResumo(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string | null }
) {
  const byUser = await supabase
    .from("clientes")
    .select("id, perfil_suitability, acesso_liberado")
    .eq("user_id", user.id)
    .maybeSingle();

  if (byUser.data) return byUser.data;

  if (!user.email) return null;

  return fetchClienteByEmail(supabase, user.email);
}

function destinoPosLogin(
  user: { user_metadata?: Record<string, unknown> },
  perfil: unknown
) {
  if (mustChangePassword(user)) return "/alterar-senha";
  return hasPerfilSuitability(perfil) ? "/dashboard" : "/onboarding";
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
  const isAlterarSenhaRoute = pathname === "/alterar-senha";
  const authCode = request.nextUrl.searchParams.get("code");

  const authError = request.nextUrl.searchParams.get("error");
  const errorCode = request.nextUrl.searchParams.get("error_code");
  if (authError && pathname === "/" && !authCode) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("error", errorCode || authError);
    return NextResponse.redirect(url);
  }

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

  if (user && isProtectedPath(pathname)) {
    const temAcesso = await usuarioTemAcesso(supabase, user);

    if (!temAcesso) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("error", "nao_autorizado");
      return NextResponse.redirect(url);
    }

    const precisaTrocarSenha = mustChangePassword(user);

    if (
      precisaTrocarSenha &&
      isProtectedPath(pathname) &&
      !isAlterarSenhaRoute
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/alterar-senha";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (isAlterarSenhaRoute && !precisaTrocarSenha) {
      const cliente = await getClienteResumo(supabase, user);
      const url = request.nextUrl.clone();
      url.pathname = destinoPosLogin(user, cliente?.perfil_suitability);
      url.search = "";
      return NextResponse.redirect(url);
    }

    const cliente = await getClienteResumo(supabase, user);
    const temPerfil = hasPerfilSuitability(cliente?.perfil_suitability);

    if (pathname === "/onboarding" && temPerfil) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (
      (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) &&
      !temPerfil
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (
      (pathname === "/preferencias" || pathname.startsWith("/preferencias/")) &&
      !temPerfil
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (isLoginRoute && user) {
    const temAcesso = await usuarioTemAcesso(supabase, user);
    if (!temAcesso) {
      return supabaseResponse;
    }

    const cliente = await getClienteResumo(supabase, user);
    const url = request.nextUrl.clone();
    url.pathname = destinoPosLogin(user, cliente?.perfil_suitability);
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
