import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Tv, 
  ArrowLeft,
  Download,
  Settings,
  Play,
  CheckCircle
} from 'lucide-react';

const GuiasInstalacao = () => {
  const guias = [
    {
      id: 'android',
      icon: Smartphone,
      title: 'Android',
      subtitle: 'Celulares e Tablets',
      color: 'from-green-500 to-green-600',
      passos: [
        {
          titulo: 'Baixar o Aplicativo',
          descricao: 'Acesse a Play Store e busque por "IPTV Smarters Pro" ou "TiviMate". Baixe e instale o aplicativo.'
        },
        {
          titulo: 'Abrir e Configurar',
          descricao: 'Abra o app e selecione "Login com Xtream Codes API" ou "Adicionar Playlist".'
        },
        {
          titulo: 'Inserir Credenciais',
          descricao: 'Digite o nome de usuário, senha e URL do servidor que você recebeu por e-mail.'
        },
        {
          titulo: 'Aproveitar!',
          descricao: 'Aguarde o carregamento da lista de canais e comece a assistir.'
        }
      ]
    },
    {
      id: 'iphone',
      icon: Smartphone,
      title: 'iPhone / iPad',
      subtitle: 'Dispositivos Apple',
      color: 'from-blue-500 to-blue-600',
      passos: [
        {
          titulo: 'Baixar o Aplicativo',
          descricao: 'Acesse a App Store e busque por "IPTV Smarters" ou "GSE Smart IPTV". Baixe e instale.'
        },
        {
          titulo: 'Abrir e Configurar',
          descricao: 'Abra o app e selecione "Adicionar Usuário" ou "Login com Xtream Codes".'
        },
        {
          titulo: 'Inserir Credenciais',
          descricao: 'Preencha os campos com o nome de usuário, senha e URL do servidor enviados por e-mail.'
        },
        {
          titulo: 'Aproveitar!',
          descricao: 'Após o carregamento, navegue pelos canais e comece a assistir.'
        }
      ]
    },
    {
      id: 'samsung',
      icon: Tv,
      title: 'TV Samsung',
      subtitle: 'Smart TVs Samsung (Tizen)',
      color: 'from-purple-500 to-purple-600',
      passos: [
        {
          titulo: 'Acessar Smart Hub',
          descricao: 'Pressione o botão Home no controle remoto para abrir o Smart Hub.'
        },
        {
          titulo: 'Buscar Aplicativo',
          descricao: 'Acesse "Apps" e busque por "Smart IPTV" ou "IPTV Smarters". Instale o app.'
        },
        {
          titulo: 'Ativar o Aplicativo',
          descricao: 'Abra o app, anote o endereço MAC exibido e acesse o site do app pelo computador para ativar.'
        },
        {
          titulo: 'Configurar Lista',
          descricao: 'No site de ativação, insira a URL M3U ou credenciais Xtream que você recebeu. Reinicie o app na TV.'
        },
        {
          titulo: 'Aproveitar!',
          descricao: 'Seus canais serão carregados automaticamente. Bom entretenimento!'
        }
      ]
    },
    {
      id: 'lg',
      icon: Tv,
      title: 'TV LG',
      subtitle: 'Smart TVs LG (webOS)',
      color: 'from-red-500 to-red-600',
      passos: [
        {
          titulo: 'Acessar LG Content Store',
          descricao: 'Pressione o botão Home e navegue até a LG Content Store.'
        },
        {
          titulo: 'Buscar Aplicativo',
          descricao: 'Busque por "Smart IPTV" ou "SS IPTV". Instale o aplicativo escolhido.'
        },
        {
          titulo: 'Ativar o Aplicativo',
          descricao: 'Abra o app e anote o código ou endereço MAC. Acesse o site oficial do app pelo computador.'
        },
        {
          titulo: 'Configurar Lista',
          descricao: 'No site, adicione sua URL M3U ou credenciais Xtream recebidas por e-mail. Salve as configurações.'
        },
        {
          titulo: 'Aproveitar!',
          descricao: 'Volte ao app na TV, atualize a lista e comece a assistir seus canais favoritos!'
        }
      ]
    }
  ];

  const getStepIcon = (index: number) => {
    const icons = [Download, Settings, Play, CheckCircle, CheckCircle];
    const Icon = icons[index] || CheckCircle;
    return Icon;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Guias de <span className="text-gradient">Instalação</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Siga os passos abaixo para configurar o IPTV no seu dispositivo. 
              Escolha o guia correspondente ao seu aparelho.
            </p>
          </div>

          {/* Guias */}
          <div className="grid gap-8">
            {guias.map((guia) => {
              const IconComponent = guia.icon;
              return (
                <div 
                  key={guia.id}
                  className="gradient-border p-6 md:p-8 rounded-2xl"
                >
                  {/* Guia Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${guia.color} flex items-center justify-center`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl md:text-2xl font-bold">{guia.title}</h2>
                      <p className="text-muted-foreground">{guia.subtitle}</p>
                    </div>
                  </div>

                  {/* Passos */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {guia.passos.map((passo, index) => {
                      const StepIcon = getStepIcon(index);
                      return (
                        <div 
                          key={index}
                          className="relative p-4 rounded-xl bg-card border border-border"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${guia.color} flex items-center justify-center text-white text-sm font-bold`}>
                              {index + 1}
                            </div>
                            <StepIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold mb-2">{passo.titulo}</h3>
                          <p className="text-sm text-muted-foreground">{passo.descricao}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Suporte */}
          <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
            <h3 className="font-display text-xl font-bold mb-2">Precisa de ajuda?</h3>
            <p className="text-muted-foreground mb-4">
              Se tiver dificuldades na instalação, entre em contato com nosso suporte via WhatsApp.
            </p>
            <Button variant="gradient" asChild>
              <a 
                href="https://wa.me/5511999999999?text=Olá! Preciso de ajuda com a instalação do IPTV."
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com Suporte
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuiasInstalacao;
