/* Service worker mínimo para instalação PWA (LEXTOR).
 * Não intercepta navegação/fetch — evita "Failed to fetch" em rotas dinâmicas.
 */
const SW_VERSION = "lextor-pwa-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Limpa caches antigos, se houver.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("lextor-") && key !== SW_VERSION)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Sem listener de fetch: o browser trata a rede normalmente.
// Isso ainda permite o app ser instalável (SW ativo + manifest).
