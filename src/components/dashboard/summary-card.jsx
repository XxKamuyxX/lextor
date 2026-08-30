"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { staggerItem } from "@/components/dashboard/motion-variants";

const cardClassName =
  "rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] cursor-default";

/**
 * @param {{
 *   label: string;
 *   value: number;
 *   hint?: string;
 *   accent?: string;
 *   format?: "brl" | "percent" | "plain";
 * }} props
 */
export function SummaryCard({
  label,
  value,
  hint,
  accent,
  format = "plain",
}) {
  const n = Number(value) || 0;

  return (
    <motion.div variants={staggerItem} className={cardClassName}>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p
        className={`mt-3 text-2xl font-bold tracking-tight tabular-nums ${accent || "text-white"}`}
      >
        {format === "brl" ? (
          <CountUp
            end={n}
            duration={2}
            decimals={2}
            decimal=","
            separator="."
            prefix="R$ "
            preserveValue
          />
        ) : format === "percent" ? (
          <>
            {n > 0 ? "+" : ""}
            <CountUp
              end={n}
              duration={2}
              decimals={2}
              decimal=","
              suffix="%"
              preserveValue
            />
          </>
        ) : (
          <CountUp end={n} duration={2} preserveValue />
        )}
      </p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </motion.div>
  );
}
