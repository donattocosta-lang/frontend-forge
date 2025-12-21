import { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PixQRCode } from './PixQRCode';

interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl?: string;
  expirationDate?: string;
}

interface MercadoPagoCheckoutProps {
  pedidoId: string;
  planoNome: string;
  valor: number;
  userEmail: string;
}

export function MercadoPagoCheckout({ pedidoId, planoNome, valor, userEmail }: MercadoPagoCheckoutProps) {
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initMP = async () => {
      try {
        // Get public key from edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago?action=get-public-key`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch public key');
        }
        
        const keyData = await response.json();
        
        if (keyData.publicKey) {
          initMercadoPago(keyData.publicKey, { locale: 'pt-BR' });
          setIsReady(true);
        } else {
          throw new Error('Public key not found in response');
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

  const handleOnSubmit = async (submitData: any) => {
    console.log('Payment form submitted:', submitData);
    setIsProcessing(true);

    try {
      // MercadoPago Payment Brick returns data in formData property
      const paymentData = submitData.formData || submitData;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago?action=process-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: paymentData.token,
            paymentMethodId: paymentData.payment_method_id,
            issuerId: paymentData.issuer_id,
            installments: paymentData.installments,
            email: paymentData.payer?.email || userEmail,
            amount: valor,
            pedidoId,
            identificationType: paymentData.payer?.identification?.type,
            identificationNumber: paymentData.payer?.identification?.number,
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
        // Check if it's a PIX payment with QR code
        if (result.pixQrCodeBase64 && result.pixQrCode) {
          setPixData({
            qrCode: result.pixQrCode,
            qrCodeBase64: result.pixQrCodeBase64,
            ticketUrl: result.pixTicketUrl,
            expirationDate: result.expirationDate,
          });
          toast({
            title: 'PIX gerado!',
            description: 'Escaneie o QR Code para pagar.',
          });
        } else {
          toast({
            title: 'Pagamento Pendente',
            description: 'Seu pagamento está sendo processado.',
          });
          navigate(`/pagamento/pendente?pedido_id=${pedidoId}`);
        }
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

  // Show PIX QR Code if available
  if (pixData) {
    return (
      <PixQRCode 
        qrCode={pixData.qrCode}
        qrCodeBase64={pixData.qrCodeBase64}
        ticketUrl={pixData.ticketUrl}
        expirationDate={pixData.expirationDate}
        valor={valor}
      />
    );
  }

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
