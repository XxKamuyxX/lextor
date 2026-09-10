"use client";

import { useEffect } from "react";

const SW_MIGRATE_KEY = "lextor-sw-v2-migrated";

/**
 * Registra SW leve (sem interceptar fetch).
 * Migra uma vez o worker antigo que quebrava /dashboard.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    async function setup() {
      try {
        if (!localStorage.getItem(SW_MIGRATE_KEY)) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            regs.map((reg) => reg.unregister().catch(() => false))
          );

          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }

          localStorage.setItem(SW_MIGRATE_KEY, "1");
        }

        if (cancelled) return;

        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        await reg.update().catch(() => undefined);
      } catch {
        // PWA opcional.
      }
    }

    setup();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
