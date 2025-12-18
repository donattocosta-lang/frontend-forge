import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PagamentoFalha = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="w-full max-w-md px-4 text-center">
          <div className="gradient-border p-8 rounded-2xl animate-slide-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            
            <h1 className="font-display text-3xl font-bold mb-2">Pagamento Não Concluído</h1>
            <p className="text-muted-foreground mb-6">
              Houve um problema ao processar seu pagamento. Por favor, tente novamente ou entre em contato com nosso suporte.
            </p>
            
            <div className="space-y-3">
              <Link to="/dashboard">
                <Button variant="gradient" className="w-full" size="lg">
                  Tentar Novamente
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full" size="lg">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PagamentoFalha;
