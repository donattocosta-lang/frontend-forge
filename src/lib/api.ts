const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
}

export const api = new ApiClient();
