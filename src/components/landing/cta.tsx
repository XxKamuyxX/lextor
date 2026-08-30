import Link from "next/link";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden bg-blue-950 px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.25)_0%,_transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
          Área exclusiva
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Acesse sua carteira, relatórios e mapeamento estratégico
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100/80">
          Clientes com plano ativo entram pela plataforma segura para
          acompanhar patrimônio, rentabilidade e preferências de investimento.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-blue-950 shadow-xl transition hover:bg-blue-50"
          >
            Entrar na plataforma
          </Link>
          <a
            href="mailto:contato@alexjdantas.com"
            className="inline-flex items-center rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Falar com a consultoria
          </a>
        </div>
      </div>
    </section>
  );
}
