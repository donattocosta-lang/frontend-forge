import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileText } from "lucide-react";

const TermosUso = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Documento Legal</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Termos de <span className="gradient-text">Uso</span>
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
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">1. Aceitação dos Termos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ao acessar e utilizar os serviços do Fast IPTV, você concorda em cumprir e estar vinculado a estes
                    Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos
                    serviços.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">2. Descrição do Serviço</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    O Fast IPTV é uma plataforma de streaming que fornece acesso a conteúdos de televisão via internet
                    (IPTV). O serviço inclui acesso a canais ao vivo, conteúdo sob demanda e outros recursos de
                    entretenimento disponibilizados através de nossa plataforma.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">3. Cadastro e Conta</h2>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Você deve fornecer informações verdadeiras, precisas e completas durante o cadastro.</li>
                    <li>É sua responsabilidade manter a confidencialidade de suas credenciais de acesso.</li>
                    <li>Você é responsável por todas as atividades realizadas em sua conta.</li>
                    <li>Notifique-nos imediatamente em caso de uso não autorizado de sua conta.</li>
                    <li>Menores de 18 anos devem ter autorização dos pais ou responsáveis legais.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">4. Uso Permitido</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    O serviço é fornecido apenas para uso pessoal e não comercial. Você concorda em:
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Utilizar o serviço apenas para fins legais e de acordo com estes termos.</li>
                    <li>Não compartilhar suas credenciais de acesso com terceiros.</li>
                    <li>Não tentar contornar, desativar ou interferir nos recursos de segurança do serviço.</li>
                    <li>Não reproduzir, distribuir ou transmitir qualquer conteúdo sem autorização.</li>
                    <li>Não utilizar o serviço para fins comerciais ou de revenda sem autorização prévia.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">5. Pagamentos e Planos</h2>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Os preços dos planos estão sujeitos a alterações, com aviso prévio de 30 dias.</li>
                    <li>O pagamento deve ser efetuado de acordo com o plano escolhido.</li>
                    <li>Não há renovação automática dos planos.</li>
                    <li>Após a ativação do serviço, não há reembolso disponível.</li>
                    <li>O teste grátis é limitado a uma solicitação por usuário.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
                    6. Disponibilidade do Serviço
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Nos esforçamos para manter o serviço disponível 24/7, mas não garantimos disponibilidade
                    ininterrupta. O serviço pode estar temporariamente indisponível devido a manutenção, atualizações ou
                    circunstâncias além do nosso controle. Não nos responsabilizamos por interrupções decorrentes de
                    problemas em sua conexão de internet ou equipamentos.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">7. Propriedade Intelectual</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Todo o conteúdo disponibilizado através do serviço, incluindo mas não limitado a textos, gráficos,
                    logotipos, ícones, imagens, clipes de áudio e software, é de propriedade do Fast IPTV ou de seus
                    licenciadores e está protegido pelas leis de direitos autorais.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
                    8. Limitação de Responsabilidade
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Em nenhuma circunstância o Fast IPTV será responsável por danos indiretos, incidentais, especiais,
                    consequenciais ou punitivos, incluindo perda de lucros, dados, uso, boa vontade ou outras perdas
                    intangíveis, resultantes de seu acesso ou uso ou incapacidade de acessar ou usar o serviço.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">9. Suspensão e Cancelamento</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Reservamo-nos o direito de suspender ou cancelar sua conta a qualquer momento, sem aviso prévio,
                    caso:
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Você viole qualquer disposição destes Termos de Uso.</li>
                    <li>Você utilize o serviço de forma ilegal ou não autorizada.</li>
                    <li>Você compartilhe suas credenciais com terceiros.</li>
                    <li>Detectemos atividade suspeita ou fraudulenta em sua conta.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">10. Alterações nos Termos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Podemos modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor
                    imediatamente após a publicação dos termos revisados. O uso continuado do serviço após qualquer
                    alteração constitui sua aceitação dos novos termos.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">11. Lei Aplicável</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa
                    relacionada a estes termos será submetida à jurisdição exclusiva dos tribunais brasileiros.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 text-foreground">12. Contato</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail
                    suporte@fast-iptv.app ou pelo WhatsApp disponível em nosso site.
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

export default TermosUso;
