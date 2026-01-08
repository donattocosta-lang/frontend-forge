import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  pedidoService, 
  planoService, 
  usuarioService, 
  solicitacaoTesteService, 
  estatisticasService 
} from '@/services/supabase';
import { iptvService, IPTVPlaylistWithUser } from '@/services/iptvService';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  ChevronRight,
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Edit,
  Eye,
  Gift,
  XCircle,
  Tv,
  Trash2,
  Link as LinkIcon
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
    testes_pendentes: 0,
  });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [solicitacoesTeste, setSolicitacoesTeste] = useState<any[]>([]);
  const [iptvPlaylists, setIptvPlaylists] = useState<IPTVPlaylistWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('todos');
  const [testeSearchTerm, setTesteSearchTerm] = useState('');
  const [testeStatusFilter, setTesteStatusFilter] = useState('todos');
  const [iptvSearchTerm, setIptvSearchTerm] = useState('');
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [selectedTeste, setSelectedTeste] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planoDialogOpen, setPlanoDialogOpen] = useState(false);
  const [usuarioDialogOpen, setUsuarioDialogOpen] = useState(false);
  const [testeDialogOpen, setTesteDialogOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<any>(null);
  const [processingTeste, setProcessingTeste] = useState(false);
  
  // IPTV Dialog state
  const [iptvDialogOpen, setIptvDialogOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    usuario_id: '',
    nome: 'Playlist Principal',
    url_m3u: ''
  });
  const [savingPlaylist, setSavingPlaylist] = useState(false);

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
        const statsData = await estatisticasService.getEstatisticas();
        setStats(statsData);
        
        const pedidosData = await pedidoService.getAllPedidos();
        setPedidos(pedidosData);
        
        const testesData = await solicitacaoTesteService.getAllSolicitacoes();
        setSolicitacoesTeste(testesData);
      }

      if (activeTab === 'pedidos') {
        const pedidosData = await pedidoService.getAllPedidos();
        setPedidos(pedidosData);
      }

      if (activeTab === 'planos') {
        const planosData = await planoService.getAllPlanos();
        setPlanos(planosData);
      }

      if (activeTab === 'usuarios') {
        const usuariosData = await usuarioService.getAllUsuarios();
        setUsuarios(usuariosData);
      }

      if (activeTab === 'testes') {
        const testesData = await solicitacaoTesteService.getAllSolicitacoes();
        setSolicitacoesTeste(testesData);
      }

      if (activeTab === 'iptv') {
        const [playlistsData, usuariosData] = await Promise.all([
          iptvService.getAllPlaylists(),
          usuarioService.getAllUsuarios()
        ]);
        setIptvPlaylists(playlistsData);
        setUsuarios(usuariosData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePedido = async (pedidoId: string, data: any) => {
    try {
      await pedidoService.updatePedido(pedidoId, data);
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

  const filteredTestes = solicitacoesTeste.filter(teste => {
    const matchesSearch = 
      teste.usuario_nome?.toLowerCase().includes(testeSearchTerm.toLowerCase()) ||
      teste.usuario_email?.toLowerCase().includes(testeSearchTerm.toLowerCase()) ||
      teste.id.includes(testeSearchTerm);
    
    const matchesStatus = testeStatusFilter === 'todos' || teste.status === testeStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleProcessarTeste = async (testeId: string, status: 'aprovado' | 'rejeitado', observacoes: string) => {
    if (!user) return;
    
    setProcessingTeste(true);
    try {
      await solicitacaoTesteService.processarSolicitacao(testeId, user.id, status, observacoes);
      toast({
        title: status === 'aprovado' ? "Teste aprovado" : "Teste rejeitado",
        description: status === 'aprovado' 
          ? "O teste grátis foi aprovado e o cliente será notificado."
          : "A solicitação foi rejeitada e o cliente será notificado.",
      });
      loadData();
      setTesteDialogOpen(false);
      setSelectedTeste(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar solicitação",
        variant: "destructive",
      });
    } finally {
      setProcessingTeste(false);
    }
  };

  const handleUpdateUsuario = async (usuarioId: string, data: any) => {
    try {
      await usuarioService.updateUsuario(usuarioId, data);
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

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.usuario_id || !newPlaylist.url_m3u) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSavingPlaylist(true);
    try {
      await iptvService.createPlaylist(newPlaylist.usuario_id, newPlaylist.nome, newPlaylist.url_m3u);
      toast({ title: "Playlist criada", description: "Playlist adicionada com sucesso." });
      setIptvDialogOpen(false);
      setNewPlaylist({ usuario_id: '', nome: 'Playlist Principal', url_m3u: '' });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSavingPlaylist(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    try {
      await iptvService.deletePlaylist(id);
      toast({ title: "Playlist removida", description: "Playlist removida com sucesso." });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const filteredIptvPlaylists = iptvPlaylists.filter(p => 
    p.usuario_nome?.toLowerCase().includes(iptvSearchTerm.toLowerCase()) ||
    p.usuario_email?.toLowerCase().includes(iptvSearchTerm.toLowerCase())
  );

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pedidos', icon: ShoppingBag, label: 'Pedidos', badge: stats.acessos_pendentes },
    { id: 'testes', icon: Gift, label: 'Testes Grátis', badge: stats.testes_pendentes },
    { id: 'iptv', icon: Tv, label: 'IPTV Playlists' },
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Dashboard View */}
              {activeTab === 'dashboard' && (
                <div>
                  <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>

                  {/* Stats Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="p-6 rounded-2xl bg-card border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-8 h-8 text-primary" />
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

                    <div className="p-6 rounded-2xl bg-card border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <Gift className="w-8 h-8 text-success" />
                      </div>
                      <p className="text-sm text-muted-foreground">Testes Pendentes</p>
                      <p className="font-display text-2xl font-bold">{stats.testes_pendentes}</p>
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
                                  <p className="font-medium">{pedido.cliente_nome || 'N/A'}</p>
                                  <p className="text-sm text-muted-foreground">{pedido.cliente_email || 'N/A'}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4">{pedido.plano_nome || 'N/A'}</td>
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
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="aguardando_pagamento">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Orders Table */}
                  <div className="gradient-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left py-4 px-4 text-sm font-medium">Cliente</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Plano</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Valor</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Data</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Pagamento</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Acesso</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPedidos.map((pedido) => (
                            <tr key={pedido.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium">{pedido.cliente_nome || 'N/A'}</p>
                                  <p className="text-sm text-muted-foreground">{pedido.cliente_email || 'N/A'}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">{pedido.plano_nome || 'N/A'}</td>
                              <td className="py-4 px-4">R$ {pedido.valor.toFixed(2).replace('.', ',')}</td>
                              <td className="py-4 px-4">
                                {format(new Date(pedido.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </td>
                              <td className="py-4 px-4">
                                <StatusBadge status={pedido.status_pagamento} type="pagamento" />
                              </td>
                              <td className="py-4 px-4">
                                <StatusBadge status={pedido.status_acesso} type="acesso" />
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
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
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
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {planos.map((plano) => (
                      <div key={plano.id} className="p-6 rounded-2xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display font-semibold">{plano.nome_comercial}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            plano.ativo ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            {plano.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-2xl font-bold mb-2">
                          R$ {plano.preco.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {plano.duracao_dias} dias
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {plano.descricao || 'Sem descrição'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usuários View */}
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
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="suspensa">Suspensa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Users Table */}
                  <div className="gradient-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left py-4 px-4 text-sm font-medium">Nome</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Email</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Telefone</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Status</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Cadastro</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsuarios.map((usuario) => (
                            <tr key={usuario.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-4 px-4 font-medium">{usuario.nome_completo}</td>
                              <td className="py-4 px-4">{usuario.email}</td>
                              <td className="py-4 px-4">{usuario.telefone || 'N/A'}</td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  usuario.status === 'ativa' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                                }`}>
                                  {usuario.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {format(new Date(usuario.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </td>
                              <td className="py-4 px-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUsuario(usuario);
                                    setUsuarioDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Testes View */}
              {activeTab === 'testes' && (
                <div>
                  <h1 className="font-display text-2xl font-bold mb-6">Solicitações de Teste Grátis</h1>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome ou email..."
                        className="pl-10"
                        value={testeSearchTerm}
                        onChange={(e) => setTesteSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={testeStatusFilter} onValueChange={setTesteStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="rejeitado">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tests Table */}
                  <div className="gradient-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left py-4 px-4 text-sm font-medium">Cliente</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Data</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Status</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTestes.map((teste) => (
                            <tr key={teste.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium">{teste.usuario_nome || 'N/A'}</p>
                                  <p className="text-sm text-muted-foreground">{teste.usuario_email || 'N/A'}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {format(new Date(teste.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  teste.status === 'aprovado' ? 'bg-success/20 text-success' :
                                  teste.status === 'rejeitado' ? 'bg-destructive/20 text-destructive' :
                                  'bg-warning/20 text-warning'
                                }`}>
                                  {teste.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {teste.status === 'pendente' && (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-success hover:text-success"
                                      onClick={() => handleProcessarTeste(teste.id, 'aprovado', '')}
                                      disabled={processingTeste}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => handleProcessarTeste(teste.id, 'rejeitado', '')}
                                      disabled={processingTeste}
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* IPTV Playlists View */}
              {activeTab === 'iptv' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="font-display text-2xl font-bold">Gerenciar Playlists IPTV</h1>
                    <Button variant="gradient" onClick={() => setIptvDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Playlist
                    </Button>
                  </div>

                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por cliente..."
                      className="pl-10"
                      value={iptvSearchTerm}
                      onChange={(e) => setIptvSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="gradient-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left py-4 px-4 text-sm font-medium">Cliente</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Nome Playlist</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">URL M3U</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Status</th>
                            <th className="text-left py-4 px-4 text-sm font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIptvPlaylists.map((playlist) => (
                            <tr key={playlist.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium">{playlist.usuario_nome}</p>
                                  <p className="text-sm text-muted-foreground">{playlist.usuario_email}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">{playlist.nome}</td>
                              <td className="py-4 px-4">
                                <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{playlist.url_m3u}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${playlist.ativo ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                                  {playlist.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeletePlaylist(playlist.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* IPTV Playlist Dialog */}
      <Dialog open={iptvDialogOpen} onOpenChange={setIptvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Playlist IPTV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Select value={newPlaylist.usuario_id} onValueChange={(v) => setNewPlaylist({...newPlaylist, usuario_id: v})}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.nome_completo} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome da Playlist</Label>
              <Input value={newPlaylist.nome} onChange={(e) => setNewPlaylist({...newPlaylist, nome: e.target.value})} className="mt-2" />
            </div>
            <div>
              <Label>URL M3U</Label>
              <Input value={newPlaylist.url_m3u} onChange={(e) => setNewPlaylist({...newPlaylist, url_m3u: e.target.value})} className="mt-2" placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIptvDialogOpen(false)}>Cancelar</Button>
              <Button variant="gradient" onClick={handleCreatePlaylist} disabled={savingPlaylist}>
                {savingPlaylist ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Criar Playlist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Pedido Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pedido</DialogTitle>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedPedido.cliente_nome} ({selectedPedido.cliente_email})
                </p>
              </div>
              <div>
                <Label>Status de Acesso</Label>
                <Select
                  value={selectedPedido.status_acesso}
                  onValueChange={(value) => setSelectedPedido({ ...selectedPedido, status_acesso: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={selectedPedido.observacoes_admin || ''}
                  onChange={(e) => setSelectedPedido({ ...selectedPedido, observacoes_admin: e.target.value })}
                  className="mt-2"
                  placeholder="Observações internas..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => handleUpdatePedido(selectedPedido.id, {
                    status_acesso: selectedPedido.status_acesso,
                    observacoes_admin: selectedPedido.observacoes_admin
                  })}
                >
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Usuario Dialog */}
      <Dialog open={usuarioDialogOpen} onOpenChange={setUsuarioDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {selectedUsuario && (
            <div className="space-y-4">
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={selectedUsuario.nome_completo}
                  onChange={(e) => setSelectedUsuario({ ...selectedUsuario, nome_completo: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={selectedUsuario.telefone || ''}
                  onChange={(e) => setSelectedUsuario({ ...selectedUsuario, telefone: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Status</Label>
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUsuarioDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => handleUpdateUsuario(selectedUsuario.id, {
                    nome_completo: selectedUsuario.nome_completo,
                    telefone: selectedUsuario.telefone,
                    status: selectedUsuario.status
                  })}
                >
                  Salvar
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
