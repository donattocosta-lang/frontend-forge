import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PlanCard } from '@/components/PlanCard';
import { Button } from '@/components/ui/button';
import { Tv, Shield, Clock, Headphones, Play, Zap, Star, ChevronRight, Film, Trophy, Clapperboard } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { planoService, pedidoService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';
import heroBg from '@/assets/hero-bg.jpg';
import featuresBg from '@/assets/features-bg.jpg';

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

  const categories = [
    { icon: Film, title: 'Filmes', description: 'Lançamentos e clássicos do cinema' },
    { icon: Clapperboard, title: 'Séries', description: 'As melhores séries do momento' },
    { icon: Trophy, title: 'Esportes', description: 'Futebol, UFC e muito mais ao vivo' },
    { icon: Tv, title: 'TV ao Vivo', description: 'Canais abertos e fechados' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative pt-24 pb-20 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6 animate-fade-in backdrop-blur-sm">
              <Play className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm text-primary font-medium">Filmes, Séries, Esportes e muito mais</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              Seu Cinema{' '}
              <span className="gradient-text">em Casa</span>
              <br />
              <span className="text-3xl md:text-5xl lg:text-6xl text-muted-foreground">24 horas por dia</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Milhares de canais ao vivo, filmes, séries e esportes. Qualidade HD e 4K com suporte dedicado. A melhor experiência em streaming.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 mb-8 animate-slide-up backdrop-blur-sm" style={{ animationDelay: '0.15s' }}>
              <Clock className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">Teste grátis de 6 horas disponível!</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button variant="gradient" size="xl" onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}>
                <Play className="w-5 h-5 fill-current" />
                Assinar Agora
              </Button>
              <Link to="/saiba-mais">
                <Button variant="outline" size="xl" className="backdrop-blur-sm bg-background/20">
                  Saiba Mais
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12 text-sm text-muted-foreground">
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

      {/* Categories Section */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-gradient-to-br from-card to-background border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 text-center group"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                  <category.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{category.title}</h3>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Background */}
      <section className="py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${featuresBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Por que escolher o <span className="gradient-text">Fast IPTV</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Oferecemos a melhor experiência em streaming com tecnologia de ponta e suporte humanizado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border hover:border-primary/50 hover-lift animate-slide-up"
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
      <section id="planos" className="py-20 bg-gradient-to-b from-background to-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Planos Flexíveis</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Escolha seu <span className="gradient-text">Plano</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quanto maior o período, maior a economia. Todos os planos incluem acesso completo a filmes, séries e esportes.
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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-secondary/30 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Film className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Pronto para sua maratona?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Junte-se a milhares de clientes satisfeitos e tenha acesso ao melhor conteúdo de streaming. Filmes, séries e esportes ao vivo.
            </p>
            <Button variant="gradient" size="xl" onClick={() => navigate('/cadastro')}>
              Começar Agora
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