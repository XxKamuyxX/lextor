const stats = [
  { value: "360°", label: "Visão patrimonial integrada" },
  { value: "100%", label: "Aderência ao suitability" },
  { value: "24/7", label: "Monitoramento de carteira" },
  { value: "1:1", label: "Relacionamento consultivo" },
];

export function LandingStats() {
  return (
    <section className="border-y border-white/5 bg-slate-950 px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center lg:text-left">
            <p className="text-3xl font-bold tracking-tight text-blue-400 sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
