import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const PagamentoPendente = () => {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get('pedido_id');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="w-full max-w-md px-4 text-center">
          <div className="gradient-border p-8 rounded-2xl animate-slide-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/20 flex items-center justify-center">
              <Clock className="w-10 h-10 text-warning" />
            </div>
            
            <h1 className="font-display text-3xl font-bold mb-2">Pagamento Pendente</h1>
            <p className="text-muted-foreground mb-6">
              Seu pagamento está sendo processado. Assim que confirmado, você receberá um e-mail com mais informações.
            </p>
            
            {pedidoId && (
              <p className="text-sm text-muted-foreground mb-6">
                ID do pedido: <span className="font-mono">{pedidoId.slice(0, 8)}...</span>
              </p>
            )}
            
            <div className="space-y-3">
              <Link to="/dashboard">
                <Button variant="gradient" className="w-full" size="lg">
                  Acompanhar Pedido
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

export default PagamentoPendente;
