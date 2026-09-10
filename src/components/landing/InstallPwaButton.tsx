"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallPwaButtonProps = {
  className?: string;
  label?: string;
  /** Se true, mostra banner flutuante no mobile quando ainda não instalado */
  showMobileBanner?: boolean;
};

function isIosDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  );
}

export function InstallPwaButton({
  className,
  label = "Baixar Aplicativo LEXTOR",
  showMobileBanner = false,
}: InstallPwaButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    setInstalled(isStandaloneDisplay());
    setIos(isIosDevice());

    try {
      if (sessionStorage.getItem("lextor-pwa-banner-dismissed") === "1") {
        setBannerDismissed(true);
      }
    } catch {
      // ignore
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setDeferredPrompt(null);
      setInstalled(true);
      setHintOpen(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (installed) return;

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    setHintOpen(true);
  }

  function dismissBanner() {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem("lextor-pwa-banner-dismissed", "1");
    } catch {
      // ignore
    }
  }

  if (installed) return null;

  const button = (
    <button
      type="button"
      onClick={handleInstall}
      className={
        className ??
        "inline-flex items-center rounded-full border border-white/15 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-400/40 hover:bg-white/5 hover:text-white sm:px-4 sm:text-sm"
      }
    >
      {label}
    </button>
  );

  return (
    <>
      {button}

      {showMobileBanner && !bannerDismissed ? (
        <div className="fixed inset-x-3 bottom-3 z-[80] sm:hidden">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/95 px-3 py-3 shadow-2xl shadow-black/50 backdrop-blur">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">
                Baixar Aplicativo LEXTOR
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Instale no celular para acesso rápido.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInstall}
              className="shrink-0 rounded-full bg-blue-700 px-3 py-2 text-xs font-semibold text-white"
            >
              Instalar
            </button>
            <button
              type="button"
              onClick={dismissBanner}
              className="shrink-0 px-1 text-slate-500"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      {hintOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Fechar"
            onClick={() => setHintOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              Instalar o app LEXTOR
            </h3>
            {ios ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
                <li>
                  Toque no botão <strong className="text-white">Compartilhar</strong>{" "}
                  do Safari (ícone de quadrado com seta).
                </li>
                <li>
                  Escolha{" "}
                  <strong className="text-white">Adicionar à Tela de Início</strong>.
                </li>
                <li>
                  Confirme em <strong className="text-white">Adicionar</strong>.
                </li>
              </ol>
            ) : (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
                <li>
                  Abra o menu do navegador{" "}
                  <strong className="text-white">(⋮ ou ⋯)</strong>.
                </li>
                <li>
                  Toque em{" "}
                  <strong className="text-white">
                    Instalar aplicativo / Adicionar à tela inicial
                  </strong>
                  .
                </li>
                <li>Confirme a instalação.</li>
              </ol>
            )}
            <button
              type="button"
              onClick={() => setHintOpen(false)}
              className="mt-6 w-full rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white"
            >
              Entendi
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
