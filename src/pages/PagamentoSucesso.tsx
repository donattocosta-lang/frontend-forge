import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const PagamentoSucesso = () => {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get('pedido_id');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="w-full max-w-md px-4 text-center">
          <div className="gradient-border p-8 rounded-2xl animate-slide-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            
            <h1 className="font-display text-3xl font-bold mb-2">Pagamento Confirmado!</h1>
            <p className="text-muted-foreground mb-6">
              Seu pagamento foi processado com sucesso. Em breve você receberá suas credenciais de acesso por e-mail.
            </p>
            
            {pedidoId && (
              <p className="text-sm text-muted-foreground mb-6">
                ID do pedido: <span className="font-mono">{pedidoId.slice(0, 8)}...</span>
              </p>
            )}
            
            <div className="space-y-3">
              <Link to="/dashboard">
                <Button variant="gradient" className="w-full" size="lg">
                  Acessar Minha Conta
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

export default PagamentoSucesso;
