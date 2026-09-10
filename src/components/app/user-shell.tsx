"use client";

import { ClientSidebar } from "@/components/layout/ClientSidebar";

type UserShellProps = {
  children: React.ReactNode;
  email?: string | null;
};

export function UserShell({ children, email }: UserShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-slate-100">
      <ClientSidebar email={email} />
      <main className="min-h-screen min-w-0 bg-[#0a0a0a] px-4 pb-10 pt-20 lg:ml-64 lg:px-8 lg:pb-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
