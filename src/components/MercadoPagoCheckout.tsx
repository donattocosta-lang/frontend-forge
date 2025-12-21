import { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, QrCode } from 'lucide-react';
import { PixQRCode } from './PixQRCode';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

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

type PaymentMethod = 'select' | 'pix' | 'card';

export function MercadoPagoCheckout({ pedidoId, planoNome, valor, userEmail }: MercadoPagoCheckoutProps) {
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('select');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initMP = async () => {
      try {
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

  const handlePixPayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago?action=create-pix`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: valor,
            pedidoId,
            email: userEmail,
            description: `Fast IPTV - ${planoNome}`,
          }),
        }
      );

      const result = await response.json();
      console.log('PIX result:', result);

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
        throw new Error(result.error || 'Erro ao gerar PIX');
      }
    } catch (error: any) {
      console.error('PIX error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar PIX. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnSubmit = async (submitData: any) => {
    console.log('Payment form submitted:', submitData);
    setIsProcessing(true);

    try {
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

  // Payment method selection
  if (paymentMethod === 'select') {
    return (
      <div className="w-full space-y-4">
        <h3 className="text-lg font-semibold text-center text-foreground mb-6">
          Escolha a forma de pagamento
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors bg-card/50 backdrop-blur"
            onClick={() => setPaymentMethod('pix')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <QrCode className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-lg">PIX</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Pagamento instantâneo via QR Code
              </CardDescription>
              <p className="text-xs text-green-500 mt-2">Aprovação imediata</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors bg-card/50 backdrop-blur"
            onClick={() => setPaymentMethod('card')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Cartão</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Crédito ou débito
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-2">Parcele em até 12x</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // PIX payment
  if (paymentMethod === 'pix') {
    return (
      <div className="w-full space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setPaymentMethod('select')}
          className="mb-2"
        >
          ← Voltar
        </Button>

        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle>Pagamento via PIX</CardTitle>
            <CardDescription>
              Clique no botão abaixo para gerar o QR Code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Valor a pagar:</p>
              <p className="text-2xl font-bold text-primary">
                R$ {valor.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <Button 
              onClick={handlePixPayment} 
              disabled={isProcessing}
              className="w-full gap-2"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Gerar QR Code PIX
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              O QR Code será exibido na tela após clicar no botão
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Card payment
  return (
    <div className="w-full">
      <Button 
        variant="ghost" 
        onClick={() => setPaymentMethod('select')}
        className="mb-4"
      >
        ← Voltar
      </Button>

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
            // Disable PIX/ticket in the Brick since we handle it separately
            ticket: undefined,
            bankTransfer: undefined,
            atm: undefined,
            mercadoPago: undefined,
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
