"use client";

import { useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ClienteCockpitLayout({ children }) {
  const params = useParams();
  const id = String(params?.id ?? "");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-slate-100">
      <Sidebar clienteId={id} />
      <main className="min-h-screen min-w-0 bg-[#0a0a0a] px-4 pb-10 pt-20 lg:ml-64 lg:px-8 lg:pb-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
