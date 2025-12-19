import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PlanCard } from '@/components/PlanCard';
import { Button } from '@/components/ui/button';
import { Tv, Shield, Clock, Headphones, Play, Zap, Star, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { planoService, pedidoService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [planos, setPlanos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlanos();
  }, []);

  const loadPlanos = async () => {
    try {
      const data = await planoService.getPlanos();
      setPlanos(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      // Mock data for demo if no plans exist
      setPlanos([
        { id: '1', nome_comercial: 'Plano Mensal', descricao: 'Acesso completo por 30 dias', duracao_dias: 30, preco: 29.90 },
        { id: '2', nome_comercial: 'Plano Trimestral', descricao: 'Acesso completo por 90 dias - Economize 15%', duracao_dias: 90, preco: 74.90 },
        { id: '3', nome_comercial: 'Plano Semestral', descricao: 'Acesso completo por 180 dias - Economize 25%', duracao_dias: 180, preco: 134.90 },
        { id: '4', nome_comercial: 'Plano Anual', descricao: 'Acesso completo por 365 dias - Melhor oferta!', duracao_dias: 365, preco: 239.90 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Faça login para continuar",
        description: "Você precisa estar logado para contratar um plano.",
      });
      navigate('/login', { state: { redirect: '/', planId } });
      return;
    }

    const plano = planos.find(p => p.id === planId);
    if (!plano) return;

    setSelectedPlan(planId);
    try {
      await pedidoService.createPedido(user.id, planId, plano.preco);
      toast({
        title: "Pedido criado!",
        description: "Seu pedido foi criado com sucesso.",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pedido",
        variant: "destructive",
      });
    } finally {
      setSelectedPlan(null);
    }
  };

  const features = [
    {
      icon: Tv,
      title: '+1000 Canais',
      description: 'Acesso a milhares de canais nacionais e internacionais em HD e 4K.',
    },
    {
      icon: Shield,
      title: 'Conexão Segura',
      description: 'Servidores estáveis e criptografia de ponta para sua segurança.',
    },
    {
      icon: Clock,
      title: '24/7 Disponível',
      description: 'Assista quando quiser, onde quiser, em qualquer dispositivo.',
    },
    {
      icon: Headphones,
      title: 'Suporte Dedicado',
      description: 'Equipe de suporte pronta para ajudar via WhatsApp.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-[128px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-6 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">A melhor experiência em streaming</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              Entretenimento{' '}
              <span className="gradient-text">Premium</span>
              <br />
              na Palma da Sua Mão
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Milhares de canais, qualidade HD e 4K, suporte dedicado. Escolha o plano ideal e comece a assistir agora mesmo.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <Clock className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">Teste grátis de 6 horas disponível!</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button variant="gradient" size="xl" onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}>
                <Play className="w-5 h-5" />
                Ver Planos
              </Button>
              <Link to="/saiba-mais">
                <Button variant="outline" size="xl">
                  Saiba Mais
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background" />
                  ))}
                </div>
                <span>+5.000 clientes</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
                <span className="ml-1">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Por que escolher o <span className="gradient-text">Don APP</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Oferecemos a melhor experiência em streaming com tecnologia de ponta e suporte humanizado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-card border border-border hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Escolha seu <span className="gradient-text">Plano</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Planos flexíveis que se adaptam às suas necessidades. Quanto maior o período, maior a economia.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              {planos.map((plano, index) => (
                <PlanCard
                  key={plano.id}
                  id={plano.id}
                  nome={plano.nome_comercial}
                  descricao={plano.descricao}
                  duracao={plano.duracao_dias}
                  preco={plano.preco}
                  destaque={index === 2}
                  onSelect={handleSelectPlan}
                  loading={selectedPlan === plano.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground mb-8">
              Junte-se a milhares de clientes satisfeitos e tenha acesso ao melhor conteúdo de streaming.
            </p>
            <Button variant="gradient" size="xl" onClick={() => navigate('/cadastro')}>
              Criar Conta Gratuita
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
