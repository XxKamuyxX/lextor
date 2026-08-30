-- Função para o middleware ler perfil sem depender de RLS/duplicatas
-- Execute no SQL Editor do Supabase

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
      order by c.created_at nulls last
      limit 1
    ),
    (
      select c.perfil_suitability
      from public.clientes c
      where lower(trim(c.email)) = lower(trim(coalesce(p_email, '')))
        and trim(coalesce(c.perfil_suitability, '')) <> ''
      order by c.created_at nulls last
      limit 1
    )
  );
$$;

grant execute on function public.obter_perfil_suitability(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
