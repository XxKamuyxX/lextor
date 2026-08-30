"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/app/logout-button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/preferencias", label: "Teses e Objetivos" },
];

type UserNavProps = {
  email?: string | null;
};

export function UserNav({ email }: UserNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="relative z-20 border-b border-sky-950/80 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="shrink-0 text-lg font-bold text-sky-400">
            ETR
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Menu principal">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(item.href)
                    ? "bg-sky-950/60 text-sky-300"
                    : "text-slate-400 hover:bg-slate-900 hover:text-sky-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {email ? (
            <p className="hidden max-w-[200px] truncate text-xs text-slate-500 lg:block">
              {email}
            </p>
          ) : null}
          <LogoutButton className="hidden sm:inline-flex" />
          <button
            type="button"
            className="inline-flex rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-900 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-user-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Abrir menu</span>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-user-nav"
          className="border-t border-sky-950/80 bg-slate-950 px-6 py-4 md:hidden"
          aria-label="Menu mobile"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive(item.href)
                      ? "bg-sky-950/60 text-sky-300"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {email ? (
            <p className="mt-4 truncate border-t border-slate-800 pt-4 text-xs text-slate-500">
              {email}
            </p>
          ) : null}
          <div className="mt-4 sm:hidden">
            <LogoutButton className="w-full justify-center" />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
