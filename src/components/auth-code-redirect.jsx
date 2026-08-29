"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCodeRedirectInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    const next = searchParams.get("next") ?? "/dashboard";
    const params = new URLSearchParams({ code, next });
    router.replace(`/auth/callback?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
      Conectando à área de membros...
    </div>
  );
}

export function AuthCodeRedirect() {
  return (
    <Suspense fallback={null}>
      <AuthCodeRedirectInner />
    </Suspense>
  );
}
