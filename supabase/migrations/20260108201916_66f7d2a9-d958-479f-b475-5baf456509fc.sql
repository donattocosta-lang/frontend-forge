-- Criar bucket para arquivos M3U
INSERT INTO storage.buckets (id, name, public)
VALUES ('m3u-files', 'm3u-files', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao bucket m3u-files
CREATE POLICY "Admins can upload m3u files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'm3u-files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update m3u files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'm3u-files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete m3u files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'm3u-files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can read their own m3u files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'm3u-files' 
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.iptv_playlists 
      WHERE usuario_id = auth.uid() 
      AND arquivo_m3u = storage.objects.name
    )
  )
);