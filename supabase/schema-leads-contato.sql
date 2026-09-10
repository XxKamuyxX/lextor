-- Leads de agendamento da landing / login
-- Execute no SQL Editor do Supabase

create extension if not exists "pgcrypto";

create table if not exists public.leads_contato (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  email text not null,
  telefone text not null,
  patrimonio_disponivel text not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_contato_created_at_idx
  on public.leads_contato (created_at desc);

alter table public.leads_contato enable row level security;

drop policy if exists "leads_contato_insert_anon" on public.leads_contato;
create policy "leads_contato_insert_anon"
  on public.leads_contato
  for insert
  to anon, authenticated
  with check (true);

-- Leitura apenas via service role (admin); sem policy de SELECT para anon.
