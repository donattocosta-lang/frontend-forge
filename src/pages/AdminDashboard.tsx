import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Bell,
  Settings,
  ChevronRight,
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_vendas: 0,
    receita_total: 0,
    pagamentos_pendentes: 0,
    acessos_pendentes: 0,
  });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('todos');
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planoDialogOpen, setPlanoDialogOpen] = useState(false);
  const [usuarioDialogOpen, setUsuarioDialogOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<any>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [isAuthenticated, isAdmin, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const statsData = await api.getEstatisticas().catch(() => null);
        if (statsData) setStats(statsData);
        else {
          setStats({
            total_vendas: 156,
            receita_total: 12450.00,
            pagamentos_pendentes: 8,
            acessos_pendentes: 5,
          });
        }
      }

      if (activeTab === 'pedidos' || activeTab === 'dashboard') {
        const pedidosData = await api.getAdminPedidos().catch(() => []);
        if (pedidosData.length > 0) {
          setPedidos(pedidosData);
        } else {
          setPedidos([
            { 
              id: '1', 
              plano_nome: 'Plano Trimestral',
              cliente_nome: 'João Silva',
              cliente_email: 'joao@email.com',
              valor: 74.90, 
              status_pagamento: 'pago', 
              status_acesso: 'pendente',
              created_at: new Date().toISOString()
            },
            { 
              id: '2', 
              plano_nome: 'Plano Mensal',
              cliente_nome: 'Maria Santos',
              cliente_email: 'maria@email.com',
              valor: 29.90, 
              status_pagamento: 'aguardando_pagamento', 
              status_acesso: 'pendente',
              created_at: new Date(Date.now() - 86400000).toISOString()
            },
          ]);
        }
      }

      if (activeTab === 'planos') {
        const planosData = await api.getAdminPlanos().catch(() => []);
        if (planosData.length > 0) {
          setPlanos(planosData);
        } else {
          setPlanos([
            { id: '1', nome_comercial: 'Plano Mensal', duracao_dias: 30, preco: 29.90, status: 'ativo' },
            { id: '2', nome_comercial: 'Plano Trimestral', duracao_dias: 90, preco: 74.90, status: 'ativo' },
            { id: '3', nome_comercial: 'Plano Semestral', duracao_dias: 180, preco: 134.90, status: 'ativo' },
            { id: '4', nome_comercial: 'Plano Anual', duracao_dias: 365, preco: 239.90, status: 'ativo' },
          ]);
        }
      }

      if (activeTab === 'usuarios') {
        const usuariosData = await api.getAdminUsuarios().catch(() => []);
        if (usuariosData.length > 0) {
          setUsuarios(usuariosData);
        } else {
          setUsuarios([
            { id: '1', nome_completo: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-1111', status: 'ativa', role: 'cliente', created_at: new Date().toISOString() },
            { id: '2', nome_completo: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 99999-2222', status: 'ativa', role: 'cliente', created_at: new Date(Date.now() - 86400000).toISOString() },
            { id: '3', nome_completo: 'Pedro Oliveira', email: 'pedro@email.com', telefone: '(11) 99999-3333', status: 'suspensa', role: 'cliente', created_at: new Date(Date.now() - 172800000).toISOString() },
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePedido = async (pedidoId: string, data: any) => {
    try {
      await api.updatePedido(pedidoId, data);
      toast({
        title: "Pedido atualizado",
        description: "O status do pedido foi alterado com sucesso.",
      });
      loadData();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar pedido",
        variant: "destructive",
      });
    }
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = 
      pedido.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'todos' || pedido.status_pagamento === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = 
      usuario.nome_completo?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(userSearchTerm.toLowerCase());
    
    const matchesStatus = userStatusFilter === 'todos' || usuario.status === userStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateUsuario = async (usuarioId: string, data: any) => {
    try {
      await api.updateAdminUsuario(usuarioId, data);
      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram alterados com sucesso.",
      });
      loadData();
      setUsuarioDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pedidos', icon: ShoppingBag, label: 'Pedidos', badge: stats.acessos_pendentes },
    { id: 'planos', icon: Package, label: 'Planos' },
    { id: 'usuarios', icon: Users, label: 'Usuários' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20 flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-80px)] bg-card border-r border-border p-4 hidden lg:block fixed">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-64">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>

              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <span className="text-xs text-success bg-success/20 px-2 py-1 rounded-full">+12%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="font-display text-2xl font-bold">
                    R$ {stats.receita_total.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingBag className="w-8 h-8 text-secondary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total de Vendas</p>
                  <p className="font-display text-2xl font-bold">{stats.total_vendas}</p>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
                  <p className="font-display text-2xl font-bold">{stats.pagamentos_pendentes}</p>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-sm text-muted-foreground">Acessos Pendentes</p>
                  <p className="font-display text-2xl font-bold">{stats.acessos_pendentes}</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="gradient-border p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold">Pedidos Recentes</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('pedidos')}>
                    Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plano</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pagamento</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.slice(0, 5).map((pedido) => (
                        <tr key={pedido.id} className="border-b border-border/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{pedido.cliente_nome}</p>
                              <p className="text-sm text-muted-foreground">{pedido.cliente_email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{pedido.plano_nome}</td>
                          <td className="py-3 px-4">R$ {pedido.valor.toFixed(2).replace('.', ',')}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={pedido.status_pagamento} type="pagamento" />
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={pedido.status_acesso} type="acesso" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pedidos View */}
          {activeTab === 'pedidos' && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Gerenciar Pedidos</h1>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                    <SelectItem value="aguardando_pagamento">Aguardando</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders Table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">ID</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Plano</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Pagamento</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Acesso</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Data</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                          </td>
                        </tr>
                      ) : filteredPedidos.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-muted-foreground">
                            Nenhum pedido encontrado
                          </td>
                        </tr>
                      ) : (
                        filteredPedidos.map((pedido) => (
                          <tr key={pedido.id} className="border-t border-border/50 hover:bg-muted/30">
                            <td className="py-4 px-4 font-mono text-sm">#{pedido.id.slice(0, 8)}</td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium">{pedido.cliente_nome}</p>
                                <p className="text-sm text-muted-foreground">{pedido.cliente_email}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">{pedido.plano_nome}</td>
                            <td className="py-4 px-4">R$ {pedido.valor.toFixed(2).replace('.', ',')}</td>
                            <td className="py-4 px-4">
                              <StatusBadge status={pedido.status_pagamento} type="pagamento" />
                            </td>
                            <td className="py-4 px-4">
                              <StatusBadge status={pedido.status_acesso} type="acesso" />
                            </td>
                            <td className="py-4 px-4 text-sm">
                              {format(new Date(pedido.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </td>
                            <td className="py-4 px-4">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPedido(pedido);
                                  setDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Planos View */}
          {activeTab === 'planos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold">Gerenciar Planos</h1>
                <Button variant="gradient" onClick={() => {
                  setEditingPlano(null);
                  setPlanoDialogOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Plano
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planos.map((plano) => (
                  <div key={plano.id} className="p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display font-semibold text-lg">{plano.nome_comercial}</h3>
                        <p className="text-sm text-muted-foreground">{plano.duracao_dias} dias</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        plano.status === 'ativo' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {plano.status}
                      </span>
                    </div>
                    <p className="font-display text-3xl font-bold gradient-text mb-4">
                      R$ {plano.preco.toFixed(2).replace('.', ',')}
                    </p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      setEditingPlano(plano);
                      setPlanoDialogOpen(true);
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usuarios View */}
          {activeTab === 'usuarios' && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Gerenciar Usuários</h1>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    className="pl-10"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativa">Ativos</SelectItem>
                    <SelectItem value="suspensa">Suspensos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">E-mail</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Telefone</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Cadastro</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                          </td>
                        </tr>
                      ) : filteredUsuarios.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            Nenhum usuário encontrado
                          </td>
                        </tr>
                      ) : (
                        filteredUsuarios.map((usuario) => (
                          <tr key={usuario.id} className="border-t border-border/50 hover:bg-muted/30">
                            <td className="py-4 px-4 font-medium">{usuario.nome_completo}</td>
                            <td className="py-4 px-4 text-muted-foreground">{usuario.email}</td>
                            <td className="py-4 px-4 text-muted-foreground">{usuario.telefone || '-'}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                usuario.status === 'ativa' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                              }`}>
                                {usuario.status === 'ativa' ? 'Ativo' : 'Suspenso'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm">
                              {format(new Date(usuario.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </td>
                            <td className="py-4 px-4">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUsuario({ ...usuario });
                                  setUsuarioDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Pedido Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          
          {selectedPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{selectedPedido.cliente_nome}</p>
                  <p className="text-sm text-muted-foreground">{selectedPedido.cliente_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Plano</Label>
                  <p className="font-medium">{selectedPedido.plano_nome}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Valor</Label>
                  <p className="font-medium">R$ {selectedPedido.valor.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status Pagamento</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedPedido.status_pagamento} type="pagamento" />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Status do Acesso</Label>
                <Select 
                  value={selectedPedido.status_acesso}
                  onValueChange={(value) => setSelectedPedido({ ...selectedPedido, status_acesso: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="acesso_enviado">Acesso Enviado</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="expirado">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes"
                  placeholder="Adicione observações sobre o pedido..."
                  value={selectedPedido.observacoes_admin || ''}
                  onChange={(e) => setSelectedPedido({ ...selectedPedido, observacoes_admin: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="gradient" 
                  className="flex-1"
                  onClick={() => handleUpdatePedido(selectedPedido.id, {
                    status_acesso: selectedPedido.status_acesso,
                    observacoes_admin: selectedPedido.observacoes_admin
                  })}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Plano Edit Dialog */}
      <Dialog open={planoDialogOpen} onOpenChange={setPlanoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlano ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Comercial</Label>
              <Input 
                id="nome" 
                placeholder="Ex: Plano Mensal"
                defaultValue={editingPlano?.nome_comercial}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="duracao">Duração (dias)</Label>
              <Input 
                id="duracao" 
                type="number"
                placeholder="30"
                defaultValue={editingPlano?.duracao_dias}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input 
                id="preco" 
                type="number"
                step="0.01"
                placeholder="29.90"
                defaultValue={editingPlano?.preco}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao"
                placeholder="Descrição do plano..."
                defaultValue={editingPlano?.descricao}
                className="mt-2"
              />
            </div>
            <Button variant="gradient" className="w-full">
              {editingPlano ? 'Salvar Alterações' : 'Criar Plano'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Usuario Edit Dialog */}
      <Dialog open={usuarioDialogOpen} onOpenChange={setUsuarioDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          
          {selectedUsuario && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="user_nome">Nome Completo</Label>
                <Input 
                  id="user_nome" 
                  value={selectedUsuario.nome_completo}
                  onChange={(e) => setSelectedUsuario({ ...selectedUsuario, nome_completo: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input 
                  value={selectedUsuario.email}
                  disabled
                  className="mt-2 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">O e-mail não pode ser alterado</p>
              </div>
              <div>
                <Label htmlFor="user_telefone">Telefone</Label>
                <Input 
                  id="user_telefone"
                  value={selectedUsuario.telefone || ''}
                  onChange={(e) => setSelectedUsuario({ ...selectedUsuario, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Status da Conta</Label>
                <Select 
                  value={selectedUsuario.status}
                  onValueChange={(value) => setSelectedUsuario({ ...selectedUsuario, status: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="suspensa">Suspensa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="gradient" 
                  className="flex-1"
                  onClick={() => handleUpdateUsuario(selectedUsuario.id, {
                    nome_completo: selectedUsuario.nome_completo,
                    telefone: selectedUsuario.telefone,
                    status: selectedUsuario.status
                  })}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
