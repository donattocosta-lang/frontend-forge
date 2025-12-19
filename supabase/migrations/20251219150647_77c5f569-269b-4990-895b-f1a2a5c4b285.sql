-- Tabela para solicitações de teste grátis
CREATE TABLE public.solicitacoes_teste (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  observacoes TEXT,
  observacoes_admin TEXT,
  aprovado_por UUID,
  aprovado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.solicitacoes_teste ENABLE ROW LEVEL SECURITY;

-- Policies para usuários verem/criarem suas próprias solicitações
CREATE POLICY "Users can view their own trial requests"
ON public.solicitacoes_teste
FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own trial requests"
ON public.solicitacoes_teste
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_solicitacoes_teste_updated_at
BEFORE UPDATE ON public.solicitacoes_teste
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de usuarios (se não existir)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome_completo TEXT NOT NULL,
  telefone TEXT,
  role TEXT NOT NULL DEFAULT 'cliente',
  status TEXT NOT NULL DEFAULT 'ativa',
  email_verificado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id);

-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'cliente');

-- Tabela de roles de usuário (para segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy para admins verem todas as solicitações
CREATE POLICY "Admins can view all trial requests"
ON public.solicitacoes_teste
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy para admins atualizarem solicitações
CREATE POLICY "Admins can update trial requests"
ON public.solicitacoes_teste
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));