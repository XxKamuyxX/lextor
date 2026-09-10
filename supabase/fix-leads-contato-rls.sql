-- Correção urgente: permitir INSERT anônimo no formulário da landing
-- Cole e execute no SQL Editor do Supabase (Dashboard → SQL)

alter table public.leads_contato enable row level security;

drop policy if exists "leads_contato_insert_anon" on public.leads_contato;
create policy "leads_contato_insert_anon"
  on public.leads_contato
  for insert
  to anon, authenticated
  with check (true);
