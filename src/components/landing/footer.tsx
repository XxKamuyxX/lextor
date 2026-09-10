import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { InstallPwaButton } from "@/components/landing/InstallPwaButton";

export function LandingFooter() {
  return (
    <footer id="contato" className="overflow-hidden border-t border-white/5 bg-black px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Logo size="sm" showLink={false} />
            <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-slate-300">
              LEXTOR — consultoria patrimonial exclusiva, sem conflito de
              interesses. Protegemos e multiplicamos o patrimônio construído
              pelo seu trabalho.
            </p>
          </div>

          <div className="grid min-w-0 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Navegação
              </p>
              <ul className="mt-4 space-y-2 font-sans text-sm text-slate-300">
                <li>
                  <a href="#filosofia" className="transition hover:text-blue-400">
                    Filosofia
                  </a>
                </li>
                <li>
                  <a href="#solucoes" className="transition hover:text-blue-400">
                    Soluções
                  </a>
                </li>
                <li>
                  <a href="#tecnologia" className="transition hover:text-blue-400">
                    Tecnologia
                  </a>
                </li>
                <li>
                  <a href="#metodologia" className="transition hover:text-blue-400">
                    Metodologia
                  </a>
                </li>
                <li>
                  <a href="#faq" className="transition hover:text-blue-400">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Plataforma
              </p>
              <ul className="mt-4 space-y-2 font-sans text-sm text-slate-300">
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
                <li>
                  <InstallPwaButton className="text-left text-sm text-slate-300 transition hover:text-blue-400" />
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Contato
              </p>
              <ul className="mt-4 space-y-2 font-sans text-sm text-slate-300">
                <li>
                  <a
                    href="mailto:contato@alexjdantas.com"
                    className="break-all transition hover:text-blue-400"
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
          <p>© {new Date().getFullYear()} LEXTOR. Todos os direitos reservados.</p>
          <p>
            Investimentos envolvem riscos. Rentabilidade passada não garante
            resultados futuros.
          </p>
        </div>
      </div>
    </footer>
  );
}
