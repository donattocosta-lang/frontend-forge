import { supabase } from '@/integrations/supabase/client';

export interface IPTVPlaylist {
  id: string;
  usuario_id: string;
  nome: string;
  url_m3u: string | null;
  arquivo_m3u: string | null;
  tipo_fonte: 'url' | 'arquivo';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPTVPlaylistWithUser extends IPTVPlaylist {
  usuario_nome?: string;
  usuario_email?: string;
}

export const iptvService = {
  // Get playlists for a specific user
  async getPlaylistsForUser(userId: string): Promise<IPTVPlaylist[]> {
    const { data, error } = await supabase
      .from('iptv_playlists')
      .select('*')
      .eq('usuario_id', userId)
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map data to include new fields with defaults for backwards compatibility
    return (data || []).map(item => ({
      ...item,
      arquivo_m3u: (item as any).arquivo_m3u || null,
      tipo_fonte: (item as any).tipo_fonte || 'url',
    }));
  },

  // Get all playlists (admin only)
  async getAllPlaylists(): Promise<IPTVPlaylistWithUser[]> {
    const { data, error } = await supabase
      .from('iptv_playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get user info for each playlist
    const playlistsWithUsers = await Promise.all(
      (data || []).map(async (playlist) => {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('nome_completo, email')
          .eq('id', playlist.usuario_id)
          .maybeSingle();

        return {
          ...playlist,
          arquivo_m3u: (playlist as any).arquivo_m3u || null,
          tipo_fonte: (playlist as any).tipo_fonte || 'url',
          usuario_nome: userData?.nome_completo || 'N/A',
          usuario_email: userData?.email || 'N/A',
        };
      })
    );

    return playlistsWithUsers;
  },

  // Create a new playlist with URL (admin only)
  async createPlaylist(usuarioId: string, nome: string, urlM3u: string): Promise<IPTVPlaylist> {
    const { data, error } = await supabase
      .from('iptv_playlists')
      .insert({
        usuario_id: usuarioId,
        nome,
        url_m3u: urlM3u,
        tipo_fonte: 'url',
      } as any)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      arquivo_m3u: null,
      tipo_fonte: 'url',
    };
  },

  // Create a new playlist with file upload (admin only)
  async createPlaylistWithFile(usuarioId: string, nome: string, file: File): Promise<IPTVPlaylist> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'm3u';
    const fileName = `${usuarioId}/${Date.now()}.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('m3u-files')
      .upload(fileName, file, {
        contentType: 'audio/x-mpegurl',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Create playlist record
    const { data, error } = await supabase
      .from('iptv_playlists')
      .insert({
        usuario_id: usuarioId,
        nome,
        url_m3u: null,
        arquivo_m3u: fileName,
        tipo_fonte: 'arquivo',
      } as any)
      .select()
      .single();

    if (error) {
      // Cleanup uploaded file on error
      await supabase.storage.from('m3u-files').remove([fileName]);
      throw error;
    }

    return {
      ...data,
      arquivo_m3u: fileName,
      tipo_fonte: 'arquivo',
    };
  },

  // Update a playlist (admin only)
  async updatePlaylist(id: string, updates: Partial<Pick<IPTVPlaylist, 'nome' | 'url_m3u' | 'ativo'>>): Promise<IPTVPlaylist> {
    const { data, error } = await supabase
      .from('iptv_playlists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      arquivo_m3u: (data as any).arquivo_m3u || null,
      tipo_fonte: (data as any).tipo_fonte || 'url',
    };
  },

  // Delete a playlist (admin only)
  async deletePlaylist(id: string): Promise<void> {
    // First get the playlist to check if it has a file
    const { data: playlist } = await supabase
      .from('iptv_playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (playlist && (playlist as any).arquivo_m3u) {
      // Delete the file from storage
      await supabase.storage.from('m3u-files').remove([(playlist as any).arquivo_m3u]);
    }

    const { error } = await supabase
      .from('iptv_playlists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Check if user has access to IPTV (has active plan or approved free trial)
  async checkUserAccess(userId: string): Promise<{ hasAccess: boolean; reason: string }> {
    // Check for active order
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('*')
      .eq('usuario_id', userId)
      .eq('status_acesso', 'ativo')
      .eq('status_pagamento', 'pago');

    if (pedidos && pedidos.length > 0) {
      // Check if any order hasn't expired
      const hasActiveOrder = pedidos.some(pedido => {
        if (!pedido.data_expiracao) return true;
        return new Date(pedido.data_expiracao) > new Date();
      });

      if (hasActiveOrder) {
        return { hasAccess: true, reason: 'Plano ativo' };
      }
    }

    // Check for approved free trial
    const { data: solicitacoes } = await supabase
      .from('solicitacoes_teste')
      .select('*')
      .eq('usuario_id', userId)
      .eq('status', 'aprovado')
      .order('aprovado_em', { ascending: false })
      .limit(1);

    if (solicitacoes && solicitacoes.length > 0) {
      const teste = solicitacoes[0];
      // Assuming trial is valid for 24 hours after approval
      if (teste.aprovado_em) {
        const approvalDate = new Date(teste.aprovado_em);
        const expirationDate = new Date(approvalDate.getTime() + 24 * 60 * 60 * 1000);
        
        if (expirationDate > new Date()) {
          return { hasAccess: true, reason: 'Teste grátis ativo' };
        }
      }
    }

    return { hasAccess: false, reason: 'Sem acesso ativo' };
  },
};
