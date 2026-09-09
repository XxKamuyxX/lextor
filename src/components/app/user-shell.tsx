"use client";

import { ClientSidebar } from "@/components/layout/ClientSidebar";

type UserShellProps = {
  children: React.ReactNode;
  email?: string | null;
};

export function UserShell({ children, email }: UserShellProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      <ClientSidebar email={email} />
      <main className="ml-64 min-h-screen bg-[#0a0a0a] p-8">{children}</main>
    </div>
  );
}
