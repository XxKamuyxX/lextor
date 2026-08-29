"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ||
        "rounded-lg border border-sky-800/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-sky-600 hover:bg-slate-900 hover:text-white"
      }
    >
      Sair
    </button>
  );
}
