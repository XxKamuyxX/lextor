-- Execute no SQL Editor do Supabase antes de rodar o robô.
-- Tabela de histórico de fechamento diário (Ações / FIIs).

create table if not exists public.cotacoes_historicas (
  id uuid primary key default gen_random_uuid(),
  ativo text not null,
  preco_fechamento numeric not null,
  data_cotacao date not null,
  created_at timestamptz not null default now()
);

create unique index if not exists cotacoes_historicas_ativo_data_uidx
  on public.cotacoes_historicas (ativo, data_cotacao);

create index if not exists cotacoes_historicas_data_idx
  on public.cotacoes_historicas (data_cotacao desc);

alter table public.cotacoes_historicas enable row level security;

-- Leitura autenticada (opcional — o robô usa service_role e ignora RLS)
drop policy if exists "cotacoes_select_authenticated" on public.cotacoes_historicas;
create policy "cotacoes_select_authenticated"
  on public.cotacoes_historicas for select to authenticated
  using (true);
