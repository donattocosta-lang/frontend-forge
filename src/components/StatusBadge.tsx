import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: 'pagamento' | 'acesso';
}

export function StatusBadge({ status, type = 'pagamento' }: StatusBadgeProps) {
  const getStyles = () => {
    if (type === 'pagamento') {
      switch (status) {
        case 'pago':
          return 'bg-success/20 text-success border-success/30';
        case 'aguardando_pagamento':
          return 'bg-warning/20 text-warning border-warning/30';
        case 'cancelado':
        case 'reembolsado':
          return 'bg-destructive/20 text-destructive border-destructive/30';
        default:
          return 'bg-muted text-muted-foreground border-border';
      }
    } else {
      switch (status) {
        case 'ativo':
        case 'acesso_enviado':
          return 'bg-success/20 text-success border-success/30';
        case 'pendente':
          return 'bg-warning/20 text-warning border-warning/30';
        case 'expirado':
          return 'bg-destructive/20 text-destructive border-destructive/30';
        default:
          return 'bg-muted text-muted-foreground border-border';
      }
    }
  };

  const getLabel = () => {
    const labels: Record<string, string> = {
      pago: 'Pago',
      aguardando_pagamento: 'Aguardando',
      cancelado: 'Cancelado',
      reembolsado: 'Reembolsado',
      ativo: 'Ativo',
      acesso_enviado: 'Enviado',
      pendente: 'Pendente',
      expirado: 'Expirado',
    };
    return labels[status] || status;
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      getStyles()
    )}>
      {getLabel()}
    </span>
  );
}
