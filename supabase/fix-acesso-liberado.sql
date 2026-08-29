-- Correção: coluna acesso_liberado (e demais colunas usadas pelo app)
-- Supabase → SQL Editor → New query → Cole e Run

create extension if not exists "pgcrypto";

-- UUID automático no id
alter table public.clientes
  alter column id set default gen_random_uuid();

-- Colunas usadas pelo login, admin, onboarding e dashboard
alter table public.clientes
  add column if not exists user_id uuid references auth.users (id),
  add column if not exists email text,
  add column if not exists nome text,
  add column if not exists cpf text,
  add column if not exists acesso_liberado boolean not null default false,
  add column if not exists perfil_suitability text,
  add column if not exists termos_aceitos_em timestamptz,
  add column if not exists suitability_respostas jsonb,
  add column if not exists preferencias_investimento jsonb;

-- Função de verificação no login
create or replace function public.verificar_acesso_membro(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clientes
    where lower(trim(email)) = lower(trim(p_email))
      and acesso_liberado = true
  );
$$;

grant execute on function public.verificar_acesso_membro(text) to anon, authenticated;

-- Atualiza cache da API (PostgREST)
notify pgrst, 'reload schema';

-- Conferir se a coluna existe
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'clientes'
order by ordinal_position;
