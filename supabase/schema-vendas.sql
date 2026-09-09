-- Tabela de vendas / operações para inteligência tributária
-- Execute no SQL Editor do Supabase

create extension if not exists "pgcrypto";

create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  ticker text not null,
  tipo text not null,
  quantidade numeric not null check (quantidade > 0),
  preco_venda numeric not null check (preco_venda >= 0),
  preco_medio numeric,
  valor_venda numeric,
  lucro numeric,
  data_venda date not null,
  created_at timestamptz not null default now()
);

create index if not exists vendas_cliente_id_idx on public.vendas (cliente_id);
create index if not exists vendas_data_venda_idx on public.vendas (data_venda);

alter table public.vendas enable row level security;

drop policy if exists "vendas_select_own" on public.vendas;
create policy "vendas_select_own"
  on public.vendas for select to authenticated
  using (
    cliente_id in (
      select id from public.clientes
      where auth.uid() = user_id
         or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- Prejuízo acumulado manual (opcional) no cadastro do cliente
alter table public.clientes
  add column if not exists prejuizos_acumulados numeric default 0;
