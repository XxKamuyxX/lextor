import Link from "next/link";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/preferencias", label: "Teses e Objetivos" },
];

export function AppSidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-6 py-5">
        <Link href="/dashboard" className="text-lg font-bold text-primary">
          Alex J. Dantas
        </Link>
        <p className="mt-1 text-xs text-muted">Área do membro</p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-slate-50"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
