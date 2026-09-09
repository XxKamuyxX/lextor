"use client";

import { useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ClienteCockpitLayout({ children }) {
  const params = useParams();
  const id = String(params?.id ?? "");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      <Sidebar clienteId={id} />
      <main className="ml-64 min-h-screen bg-[#0a0a0a] p-8">{children}</main>
    </div>
  );
}
