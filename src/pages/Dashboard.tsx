import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  ShoppingBag, 
  Bell, 
  LogOut, 
  ChevronRight, 
  Calendar,
  CreditCard,
  Clock,
  Loader2,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pedidos');
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pedidosData, notificacoesData] = await Promise.all([
        api.getPedidos().catch(() => []),
        api.getNotificacoes().catch(() => []),
      ]);
      setPedidos(pedidosData);
      setNotificacoes(notificacoesData);
    } catch (error) {
      // Mock data for demo
      setPedidos([
        { 
          id: '1', 
          plano_nome: 'Plano Trimestral', 
          valor: 74.90, 
          status_pagamento: 'pago', 
          status_acesso: 'ativo',
          data_compra: new Date().toISOString(),
          data_expiracao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadNotifications = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="gradient-border p-6 rounded-2xl mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {user?.nome_completo?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display font-semibold">{user?.nome_completo || 'Usuário'}</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('pedidos')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      activeTab === 'pedidos' ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5" />
                      <span>Meus Pedidos</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('notificacoes')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      activeTab === 'notificacoes' ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5" />
                      <span>Notificações</span>
                      {unreadNotifications > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                          {unreadNotifications}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('perfil')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      activeTab === 'perfil' ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      <span>Meu Perfil</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>

              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'pedidos' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="font-display text-2xl font-bold">Meus Pedidos</h1>
                    <Link to="/">
                      <Button variant="gradient">
                        <Package className="w-4 h-4 mr-2" />
                        Novo Plano
                      </Button>
                    </Link>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : pedidos.length === 0 ? (
                    <div className="text-center py-12 gradient-border rounded-2xl">
                      <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-display text-xl font-semibold mb-2">Nenhum pedido ainda</h3>
                      <p className="text-muted-foreground mb-6">Você ainda não contratou nenhum plano.</p>
                      <Link to="/">
                        <Button variant="gradient">Ver Planos Disponíveis</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pedidos.map((pedido) => (
                        <div key={pedido.id} className="p-6 rounded-2xl bg-card border border-border">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                              <h3 className="font-display font-semibold text-lg">{pedido.plano_nome}</h3>
                              <p className="text-sm text-muted-foreground">
                                Pedido #{pedido.id.slice(0, 8)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={pedido.status_pagamento} type="pagamento" />
                              <StatusBadge status={pedido.status_acesso} type="acesso" />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Data:</span>
                              <span>{format(new Date(pedido.data_compra), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Valor:</span>
                              <span>R$ {pedido.valor.toFixed(2).replace('.', ',')}</span>
                            </div>
                            {pedido.data_expiracao && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Expira:</span>
                                <span>{format(new Date(pedido.data_expiracao), "dd/MM/yyyy", { locale: ptBR })}</span>
                              </div>
                            )}
                          </div>

                          {pedido.status_pagamento === 'aguardando_pagamento' && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <Button variant="gradient" size="sm">
                                Pagar Agora
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notificacoes' && (
                <div>
                  <h1 className="font-display text-2xl font-bold mb-6">Notificações</h1>
                  
                  {notificacoes.length === 0 ? (
                    <div className="text-center py-12 gradient-border rounded-2xl">
                      <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-display text-xl font-semibold mb-2">Sem notificações</h3>
                      <p className="text-muted-foreground">Você não tem notificações no momento.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notificacoes.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 rounded-xl border ${notif.lida ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{notif.titulo}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{notif.mensagem}</p>
                            </div>
                            {!notif.lida && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'perfil' && (
                <div>
                  <h1 className="font-display text-2xl font-bold mb-6">Meu Perfil</h1>
                  
                  <div className="gradient-border p-6 rounded-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-muted-foreground">Nome Completo</label>
                        <p className="font-medium mt-1">{user?.nome_completo}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">E-mail</label>
                        <p className="font-medium mt-1">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Telefone</label>
                        <p className="font-medium mt-1">{user?.telefone || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Status da Conta</label>
                        <p className="font-medium mt-1 capitalize">{user?.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
