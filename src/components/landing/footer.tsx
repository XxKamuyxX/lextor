import Link from "next/link";
import { Logo } from "@/components/landing/logo";

export function LandingFooter() {
  return (
    <footer id="contato" className="border-t border-white/5 bg-black px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Logo size="sm" showLink={false} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              ETR Consultoria de Investimentos. Estratégia patrimonial com
              padrão institucional para clientes de alto patrimônio.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Navegação
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#servicos" className="transition hover:text-blue-400">
                    Serviços
                  </a>
                </li>
                <li>
                  <a href="#metodologia" className="transition hover:text-blue-400">
                    Metodologia
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="transition hover:text-blue-400">
                    Sobre
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Plataforma
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/login" className="transition hover:text-blue-400">
                    Área do cliente
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition hover:text-blue-400">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Contato
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="mailto:contato@alexjdantas.com"
                    className="transition hover:text-blue-400"
                  >
                    contato@alexjdantas.com
                  </a>
                </li>
                <li>alexjdantas.com</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/5 pt-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ETR. Todos os direitos reservados.</p>
          <p>
            Investimentos envolvem riscos. Rentabilidade passada não garante
            resultados futuros.
          </p>
        </div>
      </div>
    </footer>
  );
}
