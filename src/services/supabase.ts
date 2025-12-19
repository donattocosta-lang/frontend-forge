import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Types
export interface Usuario {
  id: string;
  email: string;
  nome_completo: string;
  telefone?: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Plano {
  id: string;
  nome: string;
  nome_comercial: string;
  descricao?: string | null;
  duracao_dias: number;
  preco: number;
  ativo: boolean;
  status: string;
  recursos?: any;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  id: string;
  usuario_id: string;
  plano_id: string;
  valor: number;
  status_pagamento: string;
  status_acesso: string;
  data_expiracao?: string | null;
  mercadopago_preference_id?: string | null;
  mercadopago_payment_id?: string | null;
  observacoes_admin?: string | null;
  created_at: string;
  updated_at: string;
  plano?: Plano;
  usuario?: Usuario;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  created_at: string;
}

export interface SolicitacaoTeste {
  id: string;
  usuario_id: string;
  status: string;
  observacoes?: string | null;
  observacoes_admin?: string | null;
  aprovado_por?: string | null;
  aprovado_em?: string | null;
  created_at: string;
  updated_at: string;
  usuario?: Usuario;
}

// Auth Services
export const authService = {
  async signUp(email: string, password: string, userData: { nome_completo: string; telefone?: string }) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome_completo: userData.nome_completo,
          telefone: userData.telefone
        }
      }
    });

    if (error) throw error;

    // Create user profile in usuarios table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert({
          id: data.user.id,
          email: email,
          nome_completo: userData.nome_completo,
          telefone: userData.telefone || null,
          role: 'cliente',
          status: 'ativa'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }
};

// Usuario Services
export const usuarioService = {
  async getProfile(userId: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: { nome_completo?: string; telefone?: string }) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllUsuarios(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateUsuario(userId: string, updates: { nome_completo?: string; telefone?: string; status?: string }) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async checkIsAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
    return !!data;
  }
};

// Planos Services
export const planoService = {
  async getPlanos(): Promise<Plano[]> {
    const { data, error } = await supabase
      .from('planos')
      .select('*')
      .eq('ativo', true)
      .order('preco', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAllPlanos(): Promise<Plano[]> {
    const { data, error } = await supabase
      .from('planos')
      .select('*')
      .order('preco', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createPlano(plano: Omit<Plano, 'id' | 'created_at' | 'updated_at'>): Promise<Plano> {
    const { data, error } = await supabase
      .from('planos')
      .insert(plano)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePlano(id: string, updates: Partial<Plano>): Promise<Plano> {
    const { data, error } = await supabase
      .from('planos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Pedidos Services
export const pedidoService = {
  async getPedidos(userId: string): Promise<Pedido[]> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        plano:planos(*)
      `)
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllPedidos(): Promise<any[]> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        plano:planos(*),
        usuario:usuarios(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Format for admin view
    return (data || []).map(p => ({
      ...p,
      plano_nome: p.plano?.nome_comercial,
      cliente_nome: p.usuario?.nome_completo,
      cliente_email: p.usuario?.email
    }));
  },

  async createPedido(userId: string, planoId: string, valor: number): Promise<Pedido> {
    const { data, error } = await supabase
      .from('pedidos')
      .insert({
        usuario_id: userId,
        plano_id: planoId,
        valor,
        status_pagamento: 'aguardando_pagamento',
        status_acesso: 'inativo'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePedido(id: string, updates: { status_acesso?: string; observacoes_admin?: string }): Promise<Pedido> {
    const { data, error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Notificações Services
export const notificacaoService = {
  async getNotificacoes(userId: string): Promise<Notificacao[]> {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async marcarLida(id: string): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id);

    if (error) throw error;
  }
};

// Solicitações de Teste Services
export const solicitacaoTesteService = {
  async getSolicitacoes(userId: string): Promise<SolicitacaoTeste[]> {
    const { data, error } = await supabase
      .from('solicitacoes_teste')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllSolicitacoes(): Promise<any[]> {
    const { data, error } = await supabase
      .from('solicitacoes_teste')
      .select(`
        *,
        usuario:usuarios(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(s => ({
      ...s,
      usuario_nome: s.usuario?.nome_completo,
      usuario_email: s.usuario?.email
    }));
  },

  async criarSolicitacao(userId: string, observacoes?: string): Promise<SolicitacaoTeste> {
    const { data, error } = await supabase
      .from('solicitacoes_teste')
      .insert({
        usuario_id: userId,
        observacoes,
        status: 'pendente'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async processarSolicitacao(
    id: string, 
    aprovadoPor: string,
    status: 'aprovado' | 'rejeitado', 
    observacoesAdmin?: string
  ): Promise<SolicitacaoTeste> {
    const updates: any = {
      status,
      observacoes_admin: observacoesAdmin
    };

    if (status === 'aprovado') {
      updates.aprovado_por = aprovadoPor;
      updates.aprovado_em = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('solicitacoes_teste')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Estatísticas Services
export const estatisticasService = {
  async getEstatisticas() {
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('valor, status_pagamento, status_acesso');

    if (pedidosError) throw pedidosError;

    const { data: testes, error: testesError } = await supabase
      .from('solicitacoes_teste')
      .select('status');

    if (testesError) throw testesError;

    const total_vendas = pedidos?.length || 0;
    const receita_total = pedidos
      ?.filter(p => p.status_pagamento === 'pago')
      .reduce((acc, p) => acc + (p.valor || 0), 0) || 0;
    const pagamentos_pendentes = pedidos?.filter(p => p.status_pagamento === 'aguardando_pagamento').length || 0;
    const acessos_pendentes = pedidos?.filter(p => p.status_acesso === 'pendente').length || 0;
    const testes_pendentes = testes?.filter(t => t.status === 'pendente').length || 0;

    return {
      total_vendas,
      receita_total,
      pagamentos_pendentes,
      acessos_pendentes,
      testes_pendentes
    };
  }
};
