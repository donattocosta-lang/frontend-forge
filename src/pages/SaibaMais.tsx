import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Tv, 
  Smartphone, 
  Monitor, 
  Wifi, 
  Check, 
  Play, 
  Zap,
  Globe,
  Shield,
  Headphones,
  ChevronRight
} from 'lucide-react';

const SaibaMais = () => {
  const dispositivos = [
    {
      icon: Tv,
      title: 'Smart TV',
      description: 'Se sua TV é Smart, não precisa de nenhum equipamento adicional! Basta instalar o aplicativo e começar a assistir.',
      highlight: true
    },
    {
      icon: Monitor,
      title: 'TV Box / Fire Stick',
      description: 'Para TVs convencionais, você pode usar dispositivos como TV Box, Fire Stick ou Chromecast.'
    },
    {
      icon: Smartphone,
      title: 'Celular e Tablet',
      description: 'Assista de qualquer lugar no seu smartphone ou tablet com nosso aplicativo dedicado.'
    },
    {
      icon: Monitor,
      title: 'Computador',
      description: 'Acesse pelo navegador ou aplicativo desktop e aproveite em telas maiores.'
    }
  ];

  const beneficios = [
    {
      icon: Globe,
      title: 'Milhares de Canais',
      description: 'Acesso a canais nacionais e internacionais, incluindo esportes, filmes, séries e muito mais.'
    },
    {
      icon: Play,
      title: 'Conteúdo On Demand',
      description: 'Filmes e séries disponíveis para assistir quando quiser, sem depender da programação.'
    },
    {
      icon: Zap,
      title: 'Alta Qualidade',
      description: 'Transmissão em HD e 4K para uma experiência visual imersiva e sem travamentos.'
    },
    {
      icon: Shield,
      title: 'Conexão Segura',
      description: 'Servidores estáveis e seguros para garantir sua privacidade e qualidade de streaming.'
    },
    {
      icon: Headphones,
      title: 'Suporte 24/7',
      description: 'Equipe de suporte disponível para ajudar com qualquer dúvida ou problema técnico.'
    },
    {
      icon: Wifi,
      title: 'Multi-Dispositivo',
      description: 'Use em vários dispositivos com uma única assinatura, mas para uso em diferentes aplicativos simultaneamente haverá cobrança adicional.'
    }
  ];

  const comoFunciona = [
    {
      step: '1',
      title: 'Escolha seu Plano',
      description: 'Selecione o plano que melhor se adapta às suas necessidades e orçamento.'
    },
    {
      step: '2',
      title: 'Realize o Pagamento',
      description: 'Pagamento seguro via Pix ou cartão de crédito com aprovação instantânea.'
    },
    {
      step: '3',
      title: 'Receba os Dados de Acesso',
      description: 'Em minutos você recebe por e-mail as credenciais para começar a usar.'
    },
    {
      step: '4',
      title: 'Instale e Aproveite',
      description: 'Configure o aplicativo no seu dispositivo e comece a assistir imediatamente.'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                O que é <span className="gradient-text">IPTV</span>?
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                IPTV (Internet Protocol Television) é uma tecnologia que permite assistir TV através da internet, 
                oferecendo milhares de canais e conteúdos on demand com qualidade superior e preço acessível.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 mb-6">
                <Zap className="w-4 h-4 text-success" />
                <span className="text-sm text-success font-medium">Experimente grátis por 6 horas antes de assinar!</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/#planos">
                  <Button variant="gradient" size="xl">
                    Ver Planos Disponíveis
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Dispositivos Section */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Onde você pode <span className="gradient-text">assistir</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nossa plataforma é compatível com diversos dispositivos. Escolha o que for mais conveniente para você.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dispositivos.map((dispositivo, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                    dispositivo.highlight 
                      ? 'gradient-border bg-primary/5 relative overflow-hidden' 
                      : 'bg-card border border-border'
                  }`}
                >
                  {dispositivo.highlight && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                        Recomendado
                      </span>
                    </div>
                  )}
                  <dispositivo.icon className={`w-12 h-12 mb-4 ${dispositivo.highlight ? 'text-primary' : 'text-secondary'}`} />
                  <h3 className="font-display font-semibold text-lg mb-2">{dispositivo.title}</h3>
                  <p className="text-sm text-muted-foreground">{dispositivo.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/20 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Sua TV é Smart? Perfeito!</h4>
                  <p className="text-sm text-muted-foreground">
                    Se você possui uma Smart TV (Samsung, LG, TCL, Philips, etc.), não é necessário comprar nenhum 
                    hardware adicional. Basta baixar nosso aplicativo diretamente na loja de apps da sua TV e pronto! 
                    Você já pode aproveitar todo o conteúdo imediatamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Como <span className="gradient-text">funciona</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Começar é muito simples. Em apenas 4 passos você estará assistindo seus canais favoritos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {comoFunciona.map((item, index) => (
                <div key={index} className="relative">
                  <div className="p-6 rounded-2xl bg-card border border-border h-full">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                      <span className="font-display font-bold text-xl text-primary-foreground">{item.step}</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {index < comoFunciona.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefícios Section */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Por que escolher o <span className="gradient-text">Fast IPTV</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Oferecemos a melhor experiência em streaming com tecnologia de ponta e suporte dedicado.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beneficios.map((beneficio, index) => (
                <div 
                  key={index} 
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <beneficio.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">{beneficio.title}</h3>
                  <p className="text-sm text-muted-foreground">{beneficio.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requisitos Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  O que você <span className="gradient-text">precisa</span>?
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Conexão com a Internet</h4>
                    <p className="text-sm text-muted-foreground">
                      Recomendamos uma velocidade mínima de 10 Mbps para streaming em HD e 25 Mbps para 4K.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Dispositivo Compatível</h4>
                    <p className="text-sm text-muted-foreground">
                      Smart TV, celular, tablet, computador ou TV Box. Para Smart TVs, não é necessário hardware adicional!
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Aplicativo Instalado</h4>
                    <p className="text-sm text-muted-foreground">
                      Após a assinatura, você receberá instruções detalhadas de como instalar e configurar o aplicativo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-muted-foreground mb-8">
                Escolha o plano ideal para você e comece a assistir seus conteúdos favoritos agora mesmo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/#planos">
                  <Button variant="gradient" size="xl">
                    Ver Planos e Preços
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button variant="outline" size="xl">
                    Criar Conta Grátis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SaibaMais;
