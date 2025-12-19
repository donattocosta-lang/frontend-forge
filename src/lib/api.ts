const API_URL = import.meta.env.VITE_API_URL || 'https://api.don-app.com';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || 'Erro na requisição');
    }

    return response.json();
  }

  // Auth
  async register(data: { email: string; senha: string; nome_completo: string; telefone?: string }) {
    return this.request<{ message: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; senha: string }) {
    const response = await this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('user');
  }

  // Planos
  async getPlanos() {
    return this.request<any[]>('/api/planos');
  }

  async getAdminPlanos() {
    return this.request<any[]>('/api/admin/planos');
  }

  async createPlano(data: any) {
    return this.request<any>('/api/admin/planos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlano(id: string, data: any) {
    return this.request<any>(`/api/admin/planos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Pedidos
  async criarPedido(planoId: string) {
    return this.request<any>('/api/pedidos', {
      method: 'POST',
      body: JSON.stringify({ plano_id: planoId }),
    });
  }

  async getPedidos() {
    return this.request<any[]>('/api/pedidos');
  }

  async getPedido(id: string) {
    return this.request<any>(`/api/pedidos/${id}`);
  }

  async getAdminPedidos(filters?: { status_pagamento?: string; status_acesso?: string }) {
    const params = new URLSearchParams();
    if (filters?.status_pagamento) params.append('status_pagamento', filters.status_pagamento);
    if (filters?.status_acesso) params.append('status_acesso', filters.status_acesso);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/api/admin/pedidos${query}`);
  }

  async updatePedido(id: string, data: { status_acesso?: string; observacoes_admin?: string }) {
    return this.request<any>(`/api/admin/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Notificações
  async getNotificacoes() {
    return this.request<any[]>('/api/notificacoes');
  }

  async marcarNotificacaoLida(id: string) {
    return this.request<any>(`/api/notificacoes/${id}/lida`, {
      method: 'PUT',
    });
  }

  // Estatísticas
  async getEstatisticas() {
    return this.request<any>('/api/admin/estatisticas');
  }

  // Perfil do usuário
  async updateProfile(data: { nome_completo?: string; telefone?: string }) {
    return this.request<any>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { senha_atual: string; nova_senha: string }) {
    return this.request<any>('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin - Usuários
  async getAdminUsuarios(filters?: { status?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/api/admin/usuarios${query}`);
  }

  async getAdminUsuario(id: string) {
    return this.request<any>(`/api/admin/usuarios/${id}`);
  }

  async updateAdminUsuario(id: string, data: { nome_completo?: string; telefone?: string; status?: string }) {
    return this.request<any>(`/api/admin/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Solicitações de Teste Grátis
  async getSolicitacoesTeste() {
    return this.request<any[]>('/api/solicitacoes-teste');
  }

  async solicitarTesteGratis(observacoes?: string) {
    return this.request<{ message: string; solicitacao: any }>('/api/solicitacoes-teste', {
      method: 'POST',
      body: JSON.stringify({ observacoes }),
    });
  }

  async getAdminSolicitacoesTeste(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<any[]>(`/api/admin/solicitacoes-teste${query}`);
  }

  async processarSolicitacaoTeste(id: string, data: { status: 'aprovado' | 'rejeitado'; observacoes_admin?: string }) {
    return this.request<{ message: string; solicitacao: any }>(`/api/admin/solicitacoes-teste/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
