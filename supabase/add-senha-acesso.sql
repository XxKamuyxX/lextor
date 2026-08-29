-- Armazena a última senha gerada pelo admin (visível só no painel admin)
alter table public.clientes
  add column if not exists senha_acesso text;
