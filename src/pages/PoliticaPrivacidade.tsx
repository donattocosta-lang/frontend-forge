import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Sua Privacidade</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Política de <span className="gradient-text">Privacidade</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Última atualização:{" "}
                {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
              <div className="bg-card border border-border rounded-2xl p-8 md:p-12 space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">1. Introdução</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    O Fast IPTV está comprometido em proteger sua privacidade. Esta Política de Privacidade explica como
                    coletamos, usamos, divulgamos e protegemos suas informações pessoais quando você utiliza nossos
                    serviços. Ao utilizar nosso serviço, você concorda com a coleta e uso de informações de acordo com
                    esta política.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">2. Informações que Coletamos</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:
                  </p>

                  <h3 className="font-display text-xl font-semibold mb-2 text-foreground">2.1 Informações Pessoais</h3>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside mb-4">
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Número de telefone</li>
                    <li>Informações de pagamento (processadas de forma segura por terceiros)</li>
                  </ul>

                  <h3 className="font-display text-xl font-semibold mb-2 text-foreground">2.2 Informações de Uso</h3>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside mb-4">
                    <li>Endereço IP</li>
                    <li>Tipo de navegador e dispositivo</li>
                    <li>Páginas visitadas e tempo de navegação</li>
                    <li>Preferências de conteúdo</li>
                    <li>Dados de uso do aplicativo</li>
                  </ul>

                  <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                    2.3 Cookies e Tecnologias Similares
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Utilizamos cookies e tecnologias de rastreamento similares para melhorar sua experiência, analisar o
                    uso do site e personalizar conteúdos.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
                    3. Como Usamos Suas Informações
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Utilizamos as informações coletadas para:
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Fornecer, manter e melhorar nossos serviços</li>
                    <li>Processar pagamentos e gerenciar sua assinatura</li>
                    <li>Enviar comunicações importantes sobre o serviço</li>
                    <li>Oferecer suporte ao cliente</li>
                    <li>Personalizar sua experiência de visualização</li>
                    <li>Detectar e prevenir fraudes e abusos</li>
                    <li>Cumprir obrigações legais</li>
                    <li>Realizar análises e pesquisas para melhorar o serviço</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
                    4. Compartilhamento de Informações
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes
                    situações:
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                    <li>
                      <strong>Prestadores de serviços:</strong> Empresas que nos auxiliam a operar o serviço
                      (processamento de pagamentos, hospedagem, análise de dados)
                    </li>
                    <li>
                      <strong>Obrigações legais:</strong> Quando exigido por lei ou ordem judicial
                    </li>
                    <li>
                      <strong>Proteção de direitos:</strong> Para proteger nossos direitos, privacidade, segurança ou
                      propriedade
                    </li>
                    <li>
                      <strong>Transferência de negócios:</strong> Em caso de fusão, aquisição ou venda de ativos
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">5. Segurança dos Dados</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações
                    pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia
                    de dados, firewalls, controles de acesso e monitoramento regular de nossos sistemas. No entanto,
                    nenhum método de transmissão pela internet ou armazenamento eletrônico é 100% seguro.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">6. Retenção de Dados</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Mantemos suas informações pessoais pelo tempo necessário para fornecer os serviços solicitados e
                    cumprir nossas obrigações legais. Após o encerramento de sua conta, podemos reter certas informações
                    por um período limitado para fins de conformidade legal, resolução de disputas e cumprimento de
                    nossos acordos.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">7. Seus Direitos</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                    <li>
                      <strong>Acesso:</strong> Solicitar uma cópia dos dados pessoais que mantemos sobre você
                    </li>
                    <li>
                      <strong>Correção:</strong> Solicitar a correção de dados imprecisos ou incompletos
                    </li>
                    <li>
                      <strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais
                    </li>
                    <li>
                      <strong>Portabilidade:</strong> Solicitar a transferência de seus dados para outro serviço
                    </li>
                    <li>
                      <strong>Oposição:</strong> Opor-se ao processamento de seus dados em certas circunstâncias
                    </li>
                    <li>
                      <strong>Revogação:</strong> Revogar seu consentimento a qualquer momento
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Para exercer esses direitos, entre em contato conosco através do e-mail suporte@fast-iptv.app.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">8. Crianças e Menores</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Nosso serviço não é direcionado a menores de 18 anos. Não coletamos intencionalmente informações
                    pessoais de crianças. Se você é pai ou responsável e acredita que seu filho nos forneceu informações
                    pessoais, entre em contato conosco imediatamente.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
                    9. Links para Sites de Terceiros
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Nosso serviço pode conter links para sites de terceiros que não são operados por nós. Não temos
                    controle sobre o conteúdo ou práticas de privacidade desses sites e não assumimos responsabilidade
                    por eles. Recomendamos que você revise a política de privacidade de cada site que visitar.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
                    10. Transferências Internacionais
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Suas informações podem ser transferidas e armazenadas em servidores localizados fora do Brasil. Ao
                    utilizar nosso serviço, você consente com essa transferência. Garantimos que todas as transferências
                    internacionais sejam realizadas em conformidade com as leis de proteção de dados aplicáveis.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
                    11. Alterações nesta Política
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer
                    alterações publicando a nova política nesta página e atualizando a data de última atualização.
                    Recomendamos que você revise esta política regularmente.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">12. Contato</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Se você tiver dúvidas sobre esta Política de Privacidade ou sobre nossas práticas de privacidade,
                    entre em contato conosco:
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
                    <li>
                      <strong>E-mail:</strong> suporte@fast-iptv.app
                    </li>
                    <li>
                      <strong>WhatsApp:</strong> Disponível em nosso site
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mt-8">
                  <p className="text-muted-foreground text-sm">
                    <strong className="text-foreground">Encarregado de Proteção de Dados (DPO):</strong> Para questões
                    relacionadas ao tratamento de dados pessoais e exercício de direitos previstos na LGPD, você pode
                    entrar em contato com nosso Encarregado de Proteção de Dados através do e-mail:
                    suporte@fast-iptv.app
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade;
