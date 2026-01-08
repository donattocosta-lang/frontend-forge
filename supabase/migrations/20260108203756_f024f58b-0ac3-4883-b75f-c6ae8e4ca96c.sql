-- Aumentar o limite de tamanho do bucket m3u-files para 150MB
UPDATE storage.buckets 
SET file_size_limit = 157286400 -- 150MB em bytes
WHERE id = 'm3u-files';