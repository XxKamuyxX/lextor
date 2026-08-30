"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ensureCliente,
  getSessionUser,
} from "@/lib/cliente";
import { mustChangePassword } from "@/lib/auth-guards";
import {
  SUITABILITY_QUESTIONS,
  calculatePerfil,
} from "@/lib/suitability";

export default function OnboardingPage() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [step, setStep] = useState("termos");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [answers, setAnswers] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const sessionUser = await getSessionUser(supabase);
        if (!sessionUser) {
          router.replace("/login");
          return;
        }

        if (mustChangePassword(sessionUser)) {
          router.replace("/alterar-senha");
          return;
        }

        const sessao = await fetch("/api/auth/vincular-sessao", {
          method: "POST",
          credentials: "same-origin",
        });
        const sessaoData = await sessao.json();
        if (!sessao.ok || !sessaoData.ok) {
          router.replace("/login?error=nao_autorizado");
          return;
        }
        if (sessaoData.perfil_suitability) {
          router.replace("/dashboard");
          return;
        }

        if (!cancelled) setUser(sessionUser);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Falha ao iniciar o onboarding.");
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const currentQuestion = SUITABILITY_QUESTIONS[questionIndex];
  const progress = useMemo(() => {
    if (step === "termos") return 8;
    if (step === "resultado") return 100;
    return (
      20 +
      Math.round(((questionIndex + 1) / SUITABILITY_QUESTIONS.length) * 70)
    );
  }, [step, questionIndex]);

  function selectAnswer(value) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function goNextQuestion() {
    if (answers[currentQuestion.id] == null) {
      setError("Selecione uma opção para continuar.");
      return;
    }
    setError(null);

    if (questionIndex < SUITABILITY_QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
      return;
    }

    const calculated = calculatePerfil(answers);
    setPerfil(calculated);
    setStep("resultado");
  }

  async function savePerfil() {
    if (!user || !perfil) return;
    setSaving(true);
    setError(null);

    try {
      const cliente = await ensureCliente(supabase, user, {
        termos_aceitos_em: new Date().toISOString(),
      });

      const payload = {
        perfil_suitability: perfil,
        termos_aceitos_em: new Date().toISOString(),
      };

      let { error: updateError } = await supabase
        .from("clientes")
        .update({ ...payload, suitability_respostas: answers })
        .eq("id", cliente.id);

      // Fallback se a coluna suitability_respostas ainda não existir
      if (updateError) {
        ({ error: updateError } = await supabase
          .from("clientes")
          .update(payload)
          .eq("id", cliente.id));
      }

      if (updateError) throw updateError;

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err?.message ||
          "Não foi possível salvar o perfil. Verifique as permissões no Supabase."
      );
      setSaving(false);
    }
  }

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Preparando onboarding...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-10 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.18)_0%,_transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-sky-400">
            Alex J. Dantas
          </Link>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Onboarding
          </p>
        </div>

        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="rounded-2xl border border-sky-900/50 bg-slate-900/80 p-8 shadow-2xl shadow-sky-950/40 backdrop-blur">
          {step === "termos" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-sky-600">
                  Etapa 1 de 2
                </p>
                <h1 className="mt-2 text-2xl font-bold text-white">
                  Termos de Serviço e Compliance
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Antes de acessar a área do cliente, confirme o aceite digital
                  dos termos regulatórios e de compliance da consultoria.
                </p>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-400">
                <p className="mb-3">
                  A plataforma de Alex J. Dantas oferece acompanhamento e
                  orientação financeira. As informações apresentadas não
                  constituem oferta pública de valores mobiliários nem
                  recomendação personalizada até a conclusão do suitability.
                </p>
                <p className="mb-3">
                  O cliente declara que as informações fornecidas são verdadeiras
                  e atualizadas, autorizando o tratamento dos dados para fins de
                  adequação de perfil (suitability), compliance e prestação do
                  serviço de consultoria.
                </p>
                <p>
                  Investimentos envolvem riscos, incluindo possível perda de
                  capital. Rentabilidade passada não garante resultados futuros.
                  Em caso de dúvidas, fale com a equipe de atendimento.
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-300">
                  Li e aceito os Termos de Serviço, a Política de Privacidade e
                  as regras de Compliance da consultoria.
                </span>
              </label>

              <button
                type="button"
                disabled={!aceitouTermos}
                onClick={() => {
                  setError(null);
                  setStep("suitability");
                }}
                className="w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar para o Suitability
              </button>
            </div>
          )}

          {step === "suitability" && currentQuestion && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-sky-600">
                  Suitability regulatório · {questionIndex + 1}/
                  {SUITABILITY_QUESTIONS.length}
                </p>
                <h1 className="mt-2 text-2xl font-bold text-white">
                  {currentQuestion.title}
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  {currentQuestion.description}
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const selected = answers[currentQuestion.id] === option.value;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => selectAnswer(option.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? "border-sky-500 bg-sky-950/50 text-sky-100"
                          : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    if (questionIndex === 0) {
                      setStep("termos");
                      return;
                    }
                    setQuestionIndex((i) => i - 1);
                  }}
                  className="rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={goNextQuestion}
                  className="flex-1 rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                >
                  {questionIndex === SUITABILITY_QUESTIONS.length - 1
                    ? "Calcular perfil"
                    : "Próxima"}
                </button>
              </div>
            </div>
          )}

          {step === "resultado" && (
            <div className="space-y-6 text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-sky-600">
                Resultado
              </p>
              <h1 className="text-2xl font-bold text-white">
                Seu perfil de investidor
              </h1>
              <p className="inline-flex rounded-full border border-sky-700/60 bg-sky-950/40 px-5 py-2 text-lg font-semibold text-sky-300">
                {perfil}
              </p>
              <p className="text-sm leading-relaxed text-slate-400">
                Este resultado será salvo em{" "}
                <span className="text-slate-300">perfil_suitability</span> e
                orientará as recomendações da consultoria. Preferências
                setoriais profundas podem ser ajustadas depois em Teses e
                Objetivos.
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={savePerfil}
                className="w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar e ir ao Dashboard"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("suitability");
                  setQuestionIndex(0);
                }}
                className="w-full text-sm text-slate-500 transition hover:text-sky-400"
              >
                Refazer questionário
              </button>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
