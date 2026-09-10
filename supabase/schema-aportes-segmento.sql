-- Segmento e suporte a Tesouro Direto nos aportes
-- Execute no SQL Editor do Supabase

alter table public.aportes
  add column if not exists segmento text,
  add column if not exists moeda text default 'BRL';

comment on column public.aportes.segmento is
  'Segmento do ativo (ex.: Energia, Papel/CRIs, Tesouro IPCA+)';

comment on column public.aportes.moeda is
  'Moeda de exposição (BRL, USD, ...)';
