"use client";

import { UserNav } from "@/components/app/user-nav";

type UserShellProps = {
  children: React.ReactNode;
  email?: string | null;
};

export function UserShell({ children, email }: UserShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.16)_0%,_transparent_55%)]"
        aria-hidden
      />
      <UserNav email={email} />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
