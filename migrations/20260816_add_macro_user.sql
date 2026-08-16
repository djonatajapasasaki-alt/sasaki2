ALTER TABLE public.macro_historico
  ADD COLUMN IF NOT EXISTS usuario_email text;

CREATE INDEX IF NOT EXISTS macro_historico_usuario_data_idx
  ON public.macro_historico (usuario_email, data DESC, id DESC);
