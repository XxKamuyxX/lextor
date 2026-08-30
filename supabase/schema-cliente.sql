-- Schema da área do cliente — compatível com tabela `clientes` já existente
-- Execute no SQL Editor do Supabase

create extension if not exists "pgcrypto";

-- Garante UUID automático em clientes.id (corrige erro 23502 no INSERT)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clientes'
      and column_name = 'id'
  ) then
    alter table public.clientes
      alter column id set default gen_random_uuid();
  end if;
end $$;

-- clientes — colunas adicionais
alter table public.clientes
  add column if not exists user_id uuid references auth.users (id),
  add column if not exists email text,
  add column if not exists nome text,
  add column if not exists acesso_liberado boolean not null default false,
  add column if not exists perfil_suitability text,
  add column if not exists termos_aceitos_em timestamptz,
  add column if not exists suitability_respostas jsonb,
  add column if not exists preferencias_investimento jsonb;

create unique index if not exists clientes_email_unique_idx
  on public.clientes (lower(trim(email)));
create index if not exists clientes_user_id_idx on public.clientes (user_id);

-- aportes — colunas adicionais
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aportes' and column_name = 'id'
  ) then
    alter table public.aportes
      alter column id set default gen_random_uuid();
  end if;
end $$;

alter table public.aportes
  add column if not exists cliente_id uuid references public.clientes (id),
  add column if not exists tipo_ativo text,
  add column if not exists ticker text,
  add column if not exists ativo text,
  add column if not exists nome text,
  add column if not exists quantidade numeric,
  add column if not exists preco_medio numeric,
  add column if not exists taxa_contratada numeric,
  add column if not exists valor_aportado numeric,
  add column if not exists data_aporte date;

create index if not exists aportes_cliente_id_idx on public.aportes (cliente_id);

-- Verificação de acesso no login (sem expor dados da tabela)
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

-- Perfil de suitability para o middleware (ignora RLS e duplicatas)
create or replace function public.obter_perfil_suitability(
  p_user_id uuid,
  p_email text
)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select c.perfil_suitability
      from public.clientes c
      where c.user_id = p_user_id
        and trim(coalesce(c.perfil_suitability, '')) <> ''
      order by c.id
      limit 1
    ),
    (
      select c.perfil_suitability
      from public.clientes c
      where lower(trim(c.email)) = lower(trim(coalesce(p_email, '')))
        and trim(coalesce(c.perfil_suitability, '')) <> ''
      order by c.id
      limit 1
    )
  );
$$;

grant execute on function public.obter_perfil_suitability(uuid, text) to anon, authenticated;

-- RLS
alter table public.clientes enable row level security;
alter table public.aportes enable row level security;

drop policy if exists "clientes_select_own" on public.clientes;
create policy "clientes_select_own"
  on public.clientes for select to authenticated
  using (
    auth.uid() = user_id
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "clientes_update_own" on public.clientes;
create policy "clientes_update_own"
  on public.clientes for update to authenticated
  using (
    auth.uid() = user_id
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    auth.uid() = user_id
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "aportes_select_own" on public.aportes;
create policy "aportes_select_own"
  on public.aportes for select to authenticated
  using (
    cliente_id in (
      select id from public.clientes
      where auth.uid() = user_id
         or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- Seed de teste (idempotente)
-- CPF 52998224725 é válido apenas para ambiente de testes
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

-- Preferência: use o painel /admin para cadastrar novos clientes
-- (requer SUPABASE_SERVICE_ROLE_KEY + ADMIN_SECRET no .env.local)
