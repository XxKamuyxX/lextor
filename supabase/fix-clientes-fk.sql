-- Correção: FK clientes_id_fkey (id não pode ser UUID aleatório se aponta para auth.users)
-- Rode no SQL Editor do Supabase ANTES de cadastrar clientes pelo /admin

create extension if not exists "pgcrypto";

-- Remove FK incorreta no id (cadastro pelo admin é ANTES do login)
alter table public.clientes
  drop constraint if exists clientes_id_fkey;

-- id próprio da tabela clientes (gerado automaticamente)
alter table public.clientes
  alter column id set default gen_random_uuid();

-- vínculo com login fica em user_id (preenchido no primeiro acesso)
alter table public.clientes
  add column if not exists user_id uuid references auth.users (id);

alter table public.clientes
  add column if not exists acesso_liberado boolean not null default false;

-- recarrega cache da API
notify pgrst, 'reload schema';

-- conferir constraints restantes
select conname, pg_get_constraintdef(oid) as definicao
from pg_constraint
where conrelid = 'public.clientes'::regclass;
