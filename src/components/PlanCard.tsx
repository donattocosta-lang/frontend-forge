import { Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  id: string;
  nome: string;
  descricao?: string;
  duracao: number;
  preco: number;
  destaque?: boolean;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function PlanCard({ id, nome, descricao, duracao, preco, destaque, onSelect, loading }: PlanCardProps) {
  const features = [
    'Acesso a todos os canais',
    'Qualidade HD e 4K',
    'Suporte via WhatsApp',
    'Guia de programação',
    duracao >= 90 ? 'Prioridade no suporte' : null,
    duracao >= 180 ? 'Acesso antecipado a novidades' : null,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 transition-all duration-300 hover-lift",
        destaque 
          ? "gradient-border bg-card" 
          : "bg-card border border-border",
        destaque && "scale-105"
      )}
    >
      {destaque && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium flex items-center gap-1">
          <Star className="w-4 h-4" /> Mais Popular
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-bold mb-2">{nome}</h3>
        {descricao && (
          <p className="text-muted-foreground text-sm">{descricao}</p>
        )}
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-muted-foreground text-lg">R$</span>
          <span className="font-display text-5xl font-bold gradient-text">
            {preco.toFixed(2).replace('.', ',')}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{duracao} dias de acesso</p>
        {duracao > 30 && (
          <p className="text-primary text-xs mt-1 flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" />
            R$ {(preco / (duracao / 30)).toFixed(2).replace('.', ',')} por mês
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={destaque ? "gradient" : "outline"}
        className="w-full"
        size="lg"
        onClick={() => onSelect(id)}
        disabled={loading}
      >
        {loading ? 'Processando...' : 'Assinar Agora'}
      </Button>
    </div>
  );
}
