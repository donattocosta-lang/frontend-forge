import { useState } from 'react';
import { Copy, Check, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PixQRCodeProps {
  qrCodeBase64: string;
  qrCode: string;
  ticketUrl?: string;
  expirationDate?: string;
  valor: number;
}

export function PixQRCode({ qrCodeBase64, qrCode, ticketUrl, expirationDate, valor }: PixQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast({
        title: 'Código copiado!',
        description: 'Cole no seu app de banco para pagar.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Tente copiar manualmente.',
        variant: 'destructive',
      });
    }
  };

  const formatExpirationDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl text-foreground">Pague com PIX</CardTitle>
        <CardDescription className="text-muted-foreground">
          Escaneie o QR Code ou copie o código para pagar
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <img 
              src={`data:image/png;base64,${qrCodeBase64}`} 
              alt="QR Code PIX" 
              className="w-48 h-48"
            />
          </div>
        </div>

        {/* Valor */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Valor a pagar:</p>
          <p className="text-2xl font-bold text-primary">
            R$ {valor.toFixed(2).replace('.', ',')}
          </p>
        </div>

        {/* Expiration */}
        {expirationDate && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Expira em: {formatExpirationDate(expirationDate)}</span>
          </div>
        )}

        {/* Copy Button */}
        <Button 
          onClick={handleCopy} 
          variant="outline" 
          className="w-full gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Código copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar código PIX
            </>
          )}
        </Button>

        {/* PIX Code (truncated) */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Código Copia e Cola:</p>
          <p className="text-xs font-mono text-foreground break-all line-clamp-3">
            {qrCode}
          </p>
        </div>

        {/* Ticket URL */}
        {ticketUrl && (
          <Button 
            variant="ghost" 
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => window.open(ticketUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Abrir página de pagamento
          </Button>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>1. Abra o app do seu banco</p>
          <p>2. Escolha pagar via PIX</p>
          <p>3. Escaneie o QR Code ou cole o código</p>
          <p>4. Confirme o pagamento</p>
        </div>
      </CardContent>
    </Card>
  );
}
