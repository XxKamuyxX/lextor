-- Garante que a verificação de acesso no login ignore RLS
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

-- Conferência rápida
select email, acesso_liberado, user_id
from public.clientes
where lower(trim(email)) = 'poucavistavidelonge@gmail.com';
