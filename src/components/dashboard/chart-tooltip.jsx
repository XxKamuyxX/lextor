"use client";

import { formatBRL } from "@/lib/cliente";

/**
 * Tooltip dark glass para Recharts.
 * Uso: <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
 */
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 shadow-xl backdrop-blur-md">
      {label != null && label !== "" ? (
        <p className="mb-1.5 text-xs font-medium text-slate-400">{label}</p>
      ) : null}
      <ul className="space-y-1">
        {payload.map((entry, index) => {
          const raw = entry?.value;
          const name = entry?.name ?? entry?.dataKey ?? "Valor";
          const isMoney =
            typeof name === "string" &&
            /valor|patrim|preço|preco|aport/i.test(name);

          const display =
            typeof raw === "number"
              ? isMoney
                ? formatBRL(raw)
                : raw.toLocaleString("pt-BR", { maximumFractionDigits: 2 })
              : String(raw ?? "—");

          return (
            <li
              key={`${name}-${index}`}
              className="flex items-center gap-2 text-slate-100"
            >
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry?.color || "#38bdf8" }}
                aria-hidden
              />
              <span className="text-slate-400">{name}:</span>
              <span className="font-medium tabular-nums">{display}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
