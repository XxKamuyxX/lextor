"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

const PATRIMONIO_OPCOES = [
  "R$ 100k a R$ 300k",
  "R$ 300k a R$ 1M",
  "Mais de R$ 1M",
];

const initialForm = {
  nomeCompleto: "",
  email: "",
  telefone: "",
  patrimonio: "",
};

const AgendarContext = createContext(null);

export function useAgendar() {
  const ctx = useContext(AgendarContext);
  if (!ctx) {
    throw new Error("useAgendar deve ser usado dentro de AgendarProvider");
  }
  return ctx;
}

function SuccessBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-20 z-[60] flex justify-center px-4 sm:top-24"
    >
      <div className="flex max-w-lg items-start gap-3 rounded-xl border border-emerald-800/60 bg-slate-900 px-4 py-3 shadow-xl shadow-black/40">
        <p className="flex-1 text-sm leading-relaxed text-emerald-300">
          {message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-slate-500 transition hover:text-slate-300"
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function AgendarModal({ open, onClose, onSuccess }) {
  const titleId = useId();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    setForm(initialForm);
    setError(null);
    setLoading(false);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  function updateField(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const nome = form.nomeCompleto.trim();
    const email = form.email.trim().toLowerCase();
    const telefone = form.telefone.trim();
    const patrimonio = form.patrimonio;

    if (!nome || !email || !telefone || !patrimonio) {
      setError("Preencha todos os campos para continuar.");
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("leads_contato")
        .insert({
          nome_completo: nome,
          email,
          telefone,
          patrimonio_disponivel: patrimonio,
        });

      if (insertError) {
        setError(
          "Não foi possível enviar sua solicitação. Tente novamente em instantes."
        );
        return;
      }

      onSuccess?.(
        "Solicitação recebida com sucesso. Nossa equipe entrará em contato em breve."
      );
      onClose();
    } catch {
      setError(
        "Não foi possível enviar sua solicitação. Tente novamente em instantes."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/50 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 transition hover:text-slate-300"
          aria-label="Fechar"
        >
          ×
        </button>

        <h2
          id={titleId}
          className="pr-8 font-sans text-xl font-semibold tracking-tight text-white"
        >
          Agendar conversa com especialista
        </h2>
        <p className="mt-2 font-sans text-sm leading-relaxed text-slate-400">
          Preencha os dados abaixo. Nossa equipe entrará em contato para
          alinhar o melhor horário.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="agendar-nome"
              className="block text-sm font-medium text-slate-300"
            >
              Nome Completo
            </label>
            <input
              id="agendar-nome"
              type="text"
              autoComplete="name"
              required
              value={form.nomeCompleto}
              onChange={updateField("nomeCompleto")}
              placeholder="Seu nome completo"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="agendar-email"
              className="block text-sm font-medium text-slate-300"
            >
              E-mail
            </label>
            <input
              id="agendar-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={updateField("email")}
              placeholder="seu@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="agendar-telefone"
              className="block text-sm font-medium text-slate-300"
            >
              Telefone/WhatsApp
            </label>
            <input
              id="agendar-telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={form.telefone}
              onChange={updateField("telefone")}
              placeholder="(11) 99999-9999"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="agendar-patrimonio"
              className="block text-sm font-medium text-slate-300"
            >
              Patrimônio Disponível para Investimento
            </label>
            <select
              id="agendar-patrimonio"
              required
              value={form.patrimonio}
              onChange={updateField("patrimonio")}
              className={inputClass}
            >
              <option value="" disabled>
                Selecione uma faixa
              </option>
              {PATRIMONIO_OPCOES.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar solicitação"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AgendarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const openAgendar = useCallback(() => {
    setOpen(true);
  }, []);

  const closeAgendar = useCallback(() => {
    setOpen(false);
  }, []);

  const dismissSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const handleSuccess = useCallback((message) => {
    setSuccessMessage(message);
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 8000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  return (
    <AgendarContext.Provider value={{ openAgendar, closeAgendar }}>
      {children}
      <AgendarModal
        open={open}
        onClose={closeAgendar}
        onSuccess={handleSuccess}
      />
      <SuccessBanner message={successMessage} onDismiss={dismissSuccess} />
    </AgendarContext.Provider>
  );
}
