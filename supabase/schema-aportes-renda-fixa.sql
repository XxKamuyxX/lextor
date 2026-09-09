-- Colunas adicionais para aportes de Renda Fixa
-- Execute no SQL Editor do Supabase

alter table public.aportes
  add column if not exists indexador text,
  add column if not exists data_vencimento date;

-- taxa_contratada já prevista em schema-cliente.sql
