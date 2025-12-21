import { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface MercadoPagoCheckoutProps {
  pedidoId: string;
  planoNome: string;
  valor: number;
  userEmail: string;
}

export function MercadoPagoCheckout({ pedidoId, planoNome, valor, userEmail }: MercadoPagoCheckoutProps) {
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initMP = async () => {
      try {
        // Get public key from edge function
        const { data, error } = await supabase.functions.invoke('mercadopago', {
          body: {},
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Fallback: try using query param
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago?action=get-public-key`
        );
        const keyData = await response.json();
        
        if (keyData.publicKey) {
          initMercadoPago(keyData.publicKey, { locale: 'pt-BR' });
          setIsReady(true);
        } else {
          throw new Error('Failed to get public key');
        }
      } catch (error) {
        console.error('Error initializing MercadoPago:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o checkout. Tente novamente.',
          variant: 'destructive',
        });
      }
    };

    initMP();
  }, [toast]);

  const handleOnSubmit = async (formData: any) => {
    console.log('Payment form submitted:', formData);
    setIsProcessing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago?action=process-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: formData.token,
            paymentMethodId: formData.payment_method_id,
            issuerId: formData.issuer_id,
            installments: formData.installments,
            email: formData.payer.email,
            amount: valor,
            pedidoId,
            identificationType: formData.payer?.identification?.type,
            identificationNumber: formData.payer?.identification?.number,
          }),
        }
      );

      const result = await response.json();
      console.log('Payment result:', result);

      if (result.status === 'approved') {
        toast({
          title: 'Pagamento Aprovado!',
          description: 'Seu pagamento foi processado com sucesso.',
        });
        navigate(`/pagamento/sucesso?pedido_id=${pedidoId}`);
      } else if (result.status === 'pending' || result.status === 'in_process') {
        toast({
          title: 'Pagamento Pendente',
          description: 'Seu pagamento está sendo processado.',
        });
        navigate(`/pagamento/pendente?pedido_id=${pedidoId}`);
      } else {
        toast({
          title: 'Pagamento não aprovado',
          description: result.message || 'Houve um problema com o pagamento. Tente novamente.',
          variant: 'destructive',
        });
        navigate(`/pagamento/falha?pedido_id=${pedidoId}`);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao processar pagamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnError = (error: any) => {
    console.error('Payment Brick error:', error);
    toast({
      title: 'Erro',
      description: 'Erro no formulário de pagamento.',
      variant: 'destructive',
    });
  };

  const handleOnReady = () => {
    console.log('Payment Brick ready');
  };

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando checkout...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 rounded-2xl">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-foreground font-medium">Processando pagamento...</p>
          </div>
        </div>
      )}
      
      <Payment
        initialization={{
          amount: valor,
          payer: {
            email: userEmail,
          },
        }}
        customization={{
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            ticket: 'all',
            bankTransfer: 'all',
            atm: 'all',
            mercadoPago: 'all',
          },
          visual: {
            style: {
              theme: 'dark',
              customVariables: {
                baseColor: '#8b5cf6',
              },
            },
          },
        }}
        onSubmit={handleOnSubmit}
        onError={handleOnError}
        onReady={handleOnReady}
      />
    </div>
  );
}
