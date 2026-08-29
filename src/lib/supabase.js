import { createBrowserClient } from "@supabase/ssr";

let browserClient = null;

function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas. Defina-as no painel da Hostinger e faça redeploy."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/** Cliente browser sob demanda (não inicializa no build/prerender). */
export function getSupabase() {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }
  return browserClient;
}

/**
 * Compatível com `import { supabase } from "@/lib/supabase"`.
 * Só cria o client na primeira chamada em runtime.
 */
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabase();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
