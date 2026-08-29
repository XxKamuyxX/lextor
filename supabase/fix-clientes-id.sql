-- Correção rápida: erro "null value in column cpf"
-- Rode no SQL Editor do Supabase

create extension if not exists "pgcrypto";

alter table public.clientes
  alter column id set default gen_random_uuid();

insert into public.clientes (id, email, nome, cpf, acesso_liberado)
select
  gen_random_uuid(),
  'poucavistavidelonge@gmail.com',
  'Cliente Teste',
  '52998224725',
  true
where not exists (
  select 1
  from public.clientes
  where lower(trim(email)) = 'poucavistavidelonge@gmail.com'
);
