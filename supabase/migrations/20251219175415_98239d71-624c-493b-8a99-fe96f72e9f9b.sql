-- Create planos table
CREATE TABLE public.planos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  nome_comercial TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  duracao_dias INTEGER NOT NULL DEFAULT 30,
  recursos JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pedidos table
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  plano_id UUID NOT NULL REFERENCES public.planos(id),
  valor DECIMAL(10,2) NOT NULL,
  status_pagamento TEXT NOT NULL DEFAULT 'aguardando_pagamento',
  status_acesso TEXT NOT NULL DEFAULT 'inativo',
  observacoes_admin TEXT,
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  data_expiracao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notificacoes table
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info',
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Planos policies (public read for active plans)
CREATE POLICY "Anyone can view active plans"
ON public.planos FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can manage all plans"
ON public.planos FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Pedidos policies
CREATE POLICY "Users can view their own orders"
ON public.pedidos FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own orders"
ON public.pedidos FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Admins can view all orders"
ON public.pedidos FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
ON public.pedidos FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Notificacoes policies
CREATE POLICY "Users can view their own notifications"
ON public.notificacoes FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own notifications"
ON public.notificacoes FOR UPDATE
USING (auth.uid() = usuario_id);

CREATE POLICY "Admins can create notifications"
ON public.notificacoes FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_planos_updated_at
BEFORE UPDATE ON public.planos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint for solicitacoes_teste
ALTER TABLE public.solicitacoes_teste 
ADD CONSTRAINT solicitacoes_teste_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;