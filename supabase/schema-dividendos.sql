-- Tabela de proventos / renda passiva
-- Execute no SQL Editor do Supabase

create extension if not exists "pgcrypto";

create table if not exists public.dividendos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  ticker text not null,
  tipo text not null,
  valor_total numeric not null check (valor_total >= 0),
  data_pagamento date not null,
  created_at timestamptz not null default now()
);

create index if not exists dividendos_cliente_id_idx
  on public.dividendos (cliente_id);

create index if not exists dividendos_data_pagamento_idx
  on public.dividendos (data_pagamento);

alter table public.dividendos enable row level security;

drop policy if exists "dividendos_select_own" on public.dividendos;
create policy "dividendos_select_own"
  on public.dividendos for select to authenticated
  using (
    cliente_id in (
      select id from public.clientes
      where auth.uid() = user_id
         or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- Inserção/atualização/exclusão apenas via service role (painel admin)
