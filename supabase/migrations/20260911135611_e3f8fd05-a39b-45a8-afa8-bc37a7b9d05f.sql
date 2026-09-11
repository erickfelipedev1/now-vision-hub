CREATE TABLE public.resumo_grupo (
  empresa TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  realizado_ano NUMERIC NOT NULL DEFAULT 0,
  meta_ano NUMERIC NOT NULL DEFAULT 0,
  fonte TEXT NOT NULL DEFAULT 'desconhecida',
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.resumo_grupo TO anon;
GRANT SELECT ON public.resumo_grupo TO authenticated;
GRANT ALL ON public.resumo_grupo TO service_role;

ALTER TABLE public.resumo_grupo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resumo do grupo e publico para leitura"
ON public.resumo_grupo FOR SELECT
USING (true);