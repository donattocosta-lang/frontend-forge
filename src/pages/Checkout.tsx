import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MercadoPagoCheckout } from '@/components/MercadoPagoCheckout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { planoService, pedidoService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Shield, Loader2, CreditCard, Lock } from 'lucide-react';

interface Pedido {
  id: string;
  plano_id: string;
  valor: number;
  plano?: {
    nome_comercial: string;
    duracao_dias: number;
  };
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  const pedidoId = searchParams.get('pedido_id');
  const planoId = searchParams.get('plano_id');

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login', { state: { redirect: `/checkout?plano_id=${planoId}` } });
      return;
    }

    const initCheckout = async () => {
      try {
        if (pedidoId) {
          // Fetch existing pedido
          const pedidos = await pedidoService.getPedidos(user!.id);
          const existingPedido = pedidos.find(p => p.id === pedidoId);
          
          if (existingPedido) {
            setPedido({
              id: existingPedido.id,
              plano_id: existingPedido.plano_id,
              valor: existingPedido.valor,
              plano: existingPedido.plano ? {
                nome_comercial: existingPedido.plano.nome_comercial,
                duracao_dias: existingPedido.plano.duracao_dias,
              } : undefined,
            });
          } else {
            toast({
              title: 'Pedido não encontrado',
              description: 'Não foi possível encontrar este pedido.',
              variant: 'destructive',
            });
            navigate('/');
          }
        } else if (planoId) {
          // Create new pedido
          const planos = await planoService.getPlanos();
          const plano = planos.find(p => p.id === planoId);
          
          if (!plano) {
            toast({
              title: 'Plano não encontrado',
              description: 'O plano selecionado não está disponível.',
              variant: 'destructive',
            });
            navigate('/');
            return;
          }

          const novoPedido = await pedidoService.createPedido(user!.id, planoId, plano.preco);
          setPedido({
            id: novoPedido.id,
            plano_id: planoId,
            valor: plano.preco,
            plano: {
              nome_comercial: plano.nome_comercial,
              duracao_dias: plano.duracao_dias,
            },
          });
        } else {
          navigate('/');
        }
      } catch (error: any) {
        console.error('Error initializing checkout:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao carregar checkout.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [pedidoId, planoId, user, isAuthenticated, authLoading, navigate, toast]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pedido) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos planos
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="gradient-border p-6 rounded-2xl sticky top-24">
                <h2 className="font-display text-xl font-bold mb-6">Resumo do Pedido</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plano</span>
                    <span className="font-medium">{pedido.plano?.nome_comercial}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duração</span>
                    <span className="font-medium">{pedido.plano?.duracao_dias} dias</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold gradient-text">
                      R$ {pedido.valor.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-success" />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>Cartão, Pix ou Boleto</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>Dados protegidos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border p-6 rounded-2xl relative">
                <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Forma de Pagamento
                </h2>
                
                <MercadoPagoCheckout
                  pedidoId={pedido.id}
                  planoNome={pedido.plano?.nome_comercial || 'Assinatura'}
                  valor={pedido.valor}
                  userEmail={user?.email || ''}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
