import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronRight } from 'lucide-react';

const FAQ = () => {
  const faqItems = [
    {
      category: 'Sobre o Serviço',
      questions: [
        {
          question: 'O que é IPTV?',
          answer: 'IPTV (Internet Protocol Television) é uma tecnologia que permite assistir conteúdos de TV através da internet. Diferente da TV a cabo ou satélite, o IPTV transmite o conteúdo usando sua conexão de internet, oferecendo maior flexibilidade e qualidade.'
        },
        {
          question: 'Quantos canais estão disponíveis?',
          answer: 'Nosso serviço oferece mais de 1.000 canais nacionais e internacionais, incluindo canais de esportes, filmes, séries, notícias, infantil e muito mais. O conteúdo é atualizado regularmente.'
        },
        {
          question: 'Qual a qualidade de imagem?',
          answer: 'Oferecemos conteúdo em diferentes qualidades, desde SD até 4K Ultra HD, dependendo do canal e da sua velocidade de internet. A maioria dos canais está disponível em HD (720p) ou Full HD (1080p).'
        },
        {
          question: 'Posso testar o serviço antes de assinar?',
          answer: 'Sim! Oferecemos um teste grátis de 6 horas para que você possa conhecer nosso serviço antes de assinar. Basta criar uma conta e solicitar o teste.'
        }
      ]
    },
    {
      category: 'Dispositivos e Compatibilidade',
      questions: [
        {
          question: 'Em quais dispositivos posso assistir?',
          answer: 'Nosso serviço é compatível com Smart TVs (Samsung, LG, TCL, etc.), TV Box, Fire Stick, Chromecast, smartphones Android e iOS, tablets e computadores (Windows, Mac, Linux).'
        },
        {
          question: 'Preciso de algum equipamento especial?',
          answer: 'Se você possui uma Smart TV, não precisa de nenhum equipamento adicional. Para TVs convencionais, você pode usar um dispositivo como TV Box, Fire Stick ou similar. Para celulares e computadores, basta instalar o aplicativo.'
        },
        {
          question: 'Quantos dispositivos posso usar simultaneamente?',
          answer: 'Cada assinatura permite o uso em 1 dispositivo por vez. Para uso simultâneo em mais dispositivos, é necessário adquirir conexões adicionais.'
        },
        {
          question: 'Qual aplicativo devo usar?',
          answer: 'Após a assinatura, você receberá instruções detalhadas sobre qual aplicativo baixar e como configurá-lo no seu dispositivo. Trabalhamos com os principais players do mercado.'
        }
      ]
    },
    {
      category: 'Conexão e Requisitos',
      questions: [
        {
          question: 'Qual a velocidade de internet necessária?',
          answer: 'Recomendamos no mínimo 10 Mbps para conteúdo em HD e 25 Mbps para conteúdo em 4K. Para uma experiência ideal, quanto mais rápida sua internet, melhor será a qualidade e estabilidade.'
        },
        {
          question: 'O serviço funciona com qualquer provedor de internet?',
          answer: 'Sim, nosso serviço funciona com qualquer provedor de internet, seja fibra óptica, cabo, rádio ou até mesmo 4G/5G. O importante é ter uma conexão estável.'
        },
        {
          question: 'Posso usar com VPN?',
          answer: 'Sim, nosso serviço é compatível com VPNs. No entanto, o uso de VPN pode afetar a velocidade da conexão.'
        }
      ]
    },
    {
      category: 'Pagamento e Planos',
      questions: [
        {
          question: 'Quais são as formas de pagamento?',
          answer: 'Aceitamos pagamentos via Pix (aprovação instantânea), cartão de crédito e boleto bancário. O Pix é a forma mais rápida, com liberação imediata do acesso.'
        },
        {
          question: 'Os planos são renovados automaticamente?',
          answer: 'Não, nossos planos não têm renovação automática. Ao final do período contratado, você poderá optar por renovar ou escolher um novo plano.'
        },
        {
          question: 'Posso cancelar a qualquer momento?',
          answer: 'Sim, você pode cancelar a qualquer momento. Como não há renovação automática, basta não renovar seu plano ao final do período contratado.'
        },
        {
          question: 'Há reembolso em caso de cancelamento?',
          answer: 'Não oferecemos reembolso após a ativação do serviço. Por isso, disponibilizamos o teste grátis de 6 horas para que você possa avaliar o serviço antes de assinar.'
        }
      ]
    },
    {
      category: 'Suporte e Problemas',
      questions: [
        {
          question: 'Como entro em contato com o suporte?',
          answer: 'Nosso suporte funciona via WhatsApp, disponível 24 horas por dia, 7 dias por semana. Basta clicar no botão flutuante do WhatsApp em qualquer página do site.'
        },
        {
          question: 'O que fazer se o serviço estiver lento ou travando?',
          answer: 'Primeiro, verifique sua conexão de internet. Em seguida, reinicie o aplicativo e seu dispositivo. Se o problema persistir, entre em contato com nosso suporte via WhatsApp.'
        },
        {
          question: 'Perdi meus dados de acesso, o que fazer?',
          answer: 'Entre em contato com nosso suporte via WhatsApp informando seu e-mail cadastrado. Verificaremos seus dados e enviaremos novas credenciais.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Central de Ajuda</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Perguntas <span className="gradient-text">Frequentes</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Encontre respostas para as dúvidas mais comuns sobre nosso serviço de IPTV.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {faqItems.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="font-display text-2xl font-bold mb-4 gradient-text">
                    {category.category}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, itemIndex) => (
                      <AccordionItem 
                        key={itemIndex} 
                        value={`${categoryIndex}-${itemIndex}`}
                        className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50"
                      >
                        <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-b from-card/50 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Ainda tem dúvidas?
              </h2>
              <p className="text-muted-foreground mb-8">
                Nossa equipe de suporte está pronta para ajudar. Entre em contato via WhatsApp!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/#planos">
                  <Button variant="gradient" size="lg">
                    Ver Planos
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/saiba-mais">
                  <Button variant="outline" size="lg">
                    Saiba Mais
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

export default FAQ;
