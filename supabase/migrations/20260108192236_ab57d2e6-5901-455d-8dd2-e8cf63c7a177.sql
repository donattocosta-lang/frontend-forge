-- Create table for storing M3U playlist links per user
CREATE TABLE public.iptv_playlists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL DEFAULT 'Playlist Principal',
    url_m3u TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (usuario_id, url_m3u)
);

-- Enable Row Level Security
ALTER TABLE public.iptv_playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view their own playlists
CREATE POLICY "Users can view their own playlists" 
ON public.iptv_playlists 
FOR SELECT 
USING (auth.uid() = usuario_id);

-- Admins can view all playlists
CREATE POLICY "Admins can view all playlists" 
ON public.iptv_playlists 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert playlists for any user
CREATE POLICY "Admins can insert playlists" 
ON public.iptv_playlists 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any playlist
CREATE POLICY "Admins can update playlists" 
ON public.iptv_playlists 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete any playlist
CREATE POLICY "Admins can delete playlists" 
ON public.iptv_playlists 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_iptv_playlists_updated_at
BEFORE UPDATE ON public.iptv_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();