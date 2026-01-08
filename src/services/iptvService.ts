import { supabase } from '@/integrations/supabase/client';

export interface IPTVPlaylist {
  id: string;
  usuario_id: string;
  nome: string;
  url_m3u: string;
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
    return data || [];
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
          usuario_nome: userData?.nome_completo || 'N/A',
          usuario_email: userData?.email || 'N/A',
        };
      })
    );

    return playlistsWithUsers;
  },

  // Create a new playlist (admin only)
  async createPlaylist(usuarioId: string, nome: string, urlM3u: string): Promise<IPTVPlaylist> {
    const { data, error } = await supabase
      .from('iptv_playlists')
      .insert({
        usuario_id: usuarioId,
        nome,
        url_m3u: urlM3u,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
    return data;
  },

  // Delete a playlist (admin only)
  async deletePlaylist(id: string): Promise<void> {
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
