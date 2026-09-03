const blocks = [
  {
    title: "O Seu Perfil",
    text: "Desenhado para profissionais, executivos e empresários com renda superior a R$ 15.000 mensais ou capital disponível para alocação a partir de R$ 100.000.",
  },
  {
    title: "O Seu Desafio",
    text: "Você sabe que dinheiro parado é corroído pela inflação, mas não tem tempo para decifrar o mercado. Está exausto das altas taxas dos grandes bancos e do conflito de interesses de profissionais que trabalham para as instituições, e não para o seu bolso.",
  },
  {
    title: "A Solução LEXTOR",
    text: "Operamos em um modelo transparente e sem comissões ocultas. Não recebemos para empurrar produtos financeiros. Nosso ganho é atrelado exclusivamente ao volume e ao sucesso do seu patrimônio. Se você cresce, nós crescemos. Suas vitórias são as nossas vitórias.",
  },
];

export function AudienceSection() {
  return (
    <section id="para-quem" className="border-t border-white/5 bg-black px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Exclusividade e Alinhamento Real de Interesses
        </h2>

        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {blocks.map((block) => (
            <div key={block.title}>
              <h3 className="text-lg font-semibold text-blue-400">{block.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-slate-200">
                {block.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
