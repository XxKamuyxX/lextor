"use client";

import { motion } from "framer-motion";

const protocols = [
  {
    title: "Criptografia de Ponta",
    text: "Seus dados e informações financeiras protegidos com os mais altos padrões de tecnologia e segurança em nuvem.",
    icon: (
      <>
        <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
        <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
        <circle cx="12" cy="15" r="0.5" />
      </>
    ),
  },
  {
    title: "Sigilo Absoluto",
    text: "Discrição total sobre a sua identidade, seu patrimônio e sua estratégia de alocação.",
    icon: (
      <>
        <path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z" />
        <path d="M9.5 12h5" />
      </>
    ),
  },
  {
    title: "Arquitetura Blindada",
    text: "Acesso restrito e autenticado, garantindo que apenas você e seu consultor tenham a visão da sua carteira.",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="1.5" />
        <rect x="4" y="14" width="16" height="6" rx="1.5" />
        <path d="M7.5 7h.01" />
        <path d="M7.5 17h.01" />
      </>
    ),
  },
];

export function SecurityProtocol() {
  return (
    <section
      id="seguranca"
      className="border-t border-white/5 bg-[#050505] px-6 py-20"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center font-serif text-2xl font-semibold tracking-tight text-white"
        >
          Privacidade e Segurança Institucional
        </motion.h3>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {protocols.map((protocol, index) => (
            <motion.article
              key={protocol.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-6 transition duration-300 hover:border-blue-700/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-blue-950/30 text-blue-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  {protocol.icon}
                </svg>
              </span>

              <div>
                <p className="font-serif text-base font-semibold tracking-tight text-white">
                  {protocol.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {protocol.text}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
