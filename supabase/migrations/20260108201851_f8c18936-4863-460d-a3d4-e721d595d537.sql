-- Adicionar colunas primeiro
ALTER TABLE public.iptv_playlists 
ADD COLUMN IF NOT EXISTS arquivo_m3u TEXT DEFAULT NULL;

ALTER TABLE public.iptv_playlists 
ADD COLUMN IF NOT EXISTS tipo_fonte TEXT DEFAULT 'url';

-- Tornar url_m3u opcional
ALTER TABLE public.iptv_playlists 
ALTER COLUMN url_m3u DROP NOT NULL;

-- Atualizar registros existentes para ter tipo_fonte = 'url'
UPDATE public.iptv_playlists SET tipo_fonte = 'url' WHERE tipo_fonte IS NULL;