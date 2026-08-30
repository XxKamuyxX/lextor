-- Histórico de benchmarks para comparação de carteira
-- Execute no SQL Editor do Supabase

create table if not exists public.benchmarks_historicos (
  id uuid primary key default gen_random_uuid(),
  indicador text not null,
  data_referencia date not null,
  valor_mensal numeric not null,
  created_at timestamptz not null default now()
);

create unique index if not exists benchmarks_historicos_indicador_data_uidx
  on public.benchmarks_historicos (indicador, data_referencia);

create index if not exists benchmarks_historicos_data_idx
  on public.benchmarks_historicos (data_referencia desc);

alter table public.benchmarks_historicos enable row level security;

drop policy if exists "benchmarks_select_authenticated" on public.benchmarks_historicos;
create policy "benchmarks_select_authenticated"
  on public.benchmarks_historicos for select to authenticated
  using (true);

-- Seed ilustrativo (últimos 12 meses) — substitua por dados oficiais quando disponível
insert into public.benchmarks_historicos (indicador, data_referencia, valor_mensal)
select * from (
  values
    ('CDI', '2025-09-01'::date, 1.05),
    ('CDI', '2025-10-01'::date, 1.03),
    ('CDI', '2025-11-01'::date, 1.02),
    ('CDI', '2025-12-01'::date, 1.01),
    ('CDI', '2026-01-01'::date, 1.04),
    ('CDI', '2026-02-01'::date, 1.02),
    ('CDI', '2026-03-01'::date, 1.01),
    ('CDI', '2026-04-01'::date, 1.03),
    ('CDI', '2026-05-01'::date, 1.02),
    ('CDI', '2026-06-01'::date, 1.01),
    ('CDI', '2026-07-01'::date, 1.04),
    ('CDI', '2026-08-01'::date, 1.02),
    ('IBOVESPA', '2025-09-01'::date, 2.10),
    ('IBOVESPA', '2025-10-01'::date, -1.20),
    ('IBOVESPA', '2025-11-01'::date, 3.40),
    ('IBOVESPA', '2025-12-01'::date, -0.80),
    ('IBOVESPA', '2026-01-01'::date, 1.50),
    ('IBOVESPA', '2026-02-01'::date, -2.30),
    ('IBOVESPA', '2026-03-01'::date, 4.10),
    ('IBOVESPA', '2026-04-01'::date, 0.60),
    ('IBOVESPA', '2026-05-01'::date, -1.10),
    ('IBOVESPA', '2026-06-01'::date, 2.80),
    ('IBOVESPA', '2026-07-01'::date, 1.20),
    ('IBOVESPA', '2026-08-01'::date, -0.50),
    ('IPCA', '2025-09-01'::date, 0.44),
    ('IPCA', '2025-10-01'::date, 0.56),
    ('IPCA', '2025-11-01'::date, 0.39),
    ('IPCA', '2025-12-01'::date, 0.52),
    ('IPCA', '2026-01-01'::date, 0.42),
    ('IPCA', '2026-02-01'::date, 0.48),
    ('IPCA', '2026-03-01'::date, 0.41),
    ('IPCA', '2026-04-01'::date, 0.45),
    ('IPCA', '2026-05-01'::date, 0.43),
    ('IPCA', '2026-06-01'::date, 0.47),
    ('IPCA', '2026-07-01'::date, 0.40),
    ('IPCA', '2026-08-01'::date, 0.46)
) as v(indicador, data_referencia, valor_mensal)
where not exists (
  select 1 from public.benchmarks_historicos b
  where b.indicador = v.indicador
    and b.data_referencia = v.data_referencia
);

notify pgrst, 'reload schema';
