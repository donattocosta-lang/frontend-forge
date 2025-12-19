-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE EXTERNO
-- Plataforma de Revenda IPTV
-- =====================================================
-- Execute este script no SQL Editor do seu Supabase
-- =====================================================

-- =====================================================
-- 1. CRIAR ENUM DE ROLES
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'cliente');
    END IF;
END $$;

-- =====================================================
-- 2. CRIAR TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nome_completo TEXT NOT NULL,
    telefone TEXT,
    role TEXT NOT NULL DEFAULT 'cliente',
    status TEXT NOT NULL DEFAULT 'ativa',
    email_verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. CRIAR TABELA DE ROLES DE USUÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'cliente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- =====================================================
-- 4. CRIAR TABELA DE PLANOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.planos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    nome_comercial TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC NOT NULL,
    duracao_dias INTEGER NOT NULL DEFAULT 30,
    recursos JSONB DEFAULT '[]'::jsonb,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. CRIAR TABELA DE PEDIDOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    plano_id UUID NOT NULL REFERENCES public.planos(id) ON DELETE RESTRICT,
    valor NUMERIC NOT NULL,
    status_pagamento TEXT NOT NULL DEFAULT 'aguardando_pagamento',
    status_acesso TEXT NOT NULL DEFAULT 'inativo',
    data_expiracao TIMESTAMP WITH TIME ZONE,
    mercadopago_preference_id TEXT,
    mercadopago_payment_id TEXT,
    observacoes_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 6. CRIAR TABELA DE NOTIFICAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'info',
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 7. CRIAR TABELA DE SOLICITAÇÕES DE TESTE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.solicitacoes_teste (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pendente',
    observacoes TEXT,
    observacoes_admin TEXT,
    aprovado_por UUID REFERENCES public.usuarios(id),
    aprovado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 8. CRIAR FUNÇÃO DE VERIFICAÇÃO DE ROLE
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- =====================================================
-- 9. CRIAR FUNÇÃO DE ATUALIZAÇÃO DE UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- =====================================================
-- 10. CRIAR TRIGGERS DE UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_planos_updated_at ON public.planos;
CREATE TRIGGER update_planos_updated_at
    BEFORE UPDATE ON public.planos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pedidos_updated_at ON public.pedidos;
CREATE TRIGGER update_pedidos_updated_at
    BEFORE UPDATE ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_solicitacoes_teste_updated_at ON public.solicitacoes_teste;
CREATE TRIGGER update_solicitacoes_teste_updated_at
    BEFORE UPDATE ON public.solicitacoes_teste
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 11. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_teste ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 12. POLÍTICAS RLS - USUÁRIOS
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
CREATE POLICY "Users can view their own profile" 
    ON public.usuarios 
    FOR SELECT 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.usuarios;
CREATE POLICY "Users can insert their own profile" 
    ON public.usuarios 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.usuarios;
CREATE POLICY "Users can update their own profile" 
    ON public.usuarios 
    FOR UPDATE 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.usuarios;
CREATE POLICY "Admins can view all users" 
    ON public.usuarios 
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 13. POLÍTICAS RLS - USER_ROLES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role" 
    ON public.user_roles 
    FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" 
    ON public.user_roles 
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" 
    ON public.user_roles 
    FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" 
    ON public.user_roles 
    FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 14. POLÍTICAS RLS - PLANOS
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.planos;
CREATE POLICY "Anyone can view active plans" 
    ON public.planos 
    FOR SELECT 
    USING (ativo = TRUE);

DROP POLICY IF EXISTS "Admins can manage all plans" ON public.planos;
CREATE POLICY "Admins can manage all plans" 
    ON public.planos 
    FOR ALL 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 15. POLÍTICAS RLS - PEDIDOS
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own orders" ON public.pedidos;
CREATE POLICY "Users can view their own orders" 
    ON public.pedidos 
    FOR SELECT 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can create their own orders" ON public.pedidos;
CREATE POLICY "Users can create their own orders" 
    ON public.pedidos 
    FOR INSERT 
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON public.pedidos;
CREATE POLICY "Admins can view all orders" 
    ON public.pedidos 
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all orders" ON public.pedidos;
CREATE POLICY "Admins can update all orders" 
    ON public.pedidos 
    FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 16. POLÍTICAS RLS - NOTIFICAÇÕES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notificacoes;
CREATE POLICY "Users can view their own notifications" 
    ON public.notificacoes 
    FOR SELECT 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notificacoes;
CREATE POLICY "Users can update their own notifications" 
    ON public.notificacoes 
    FOR UPDATE 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notificacoes;
CREATE POLICY "Admins can create notifications" 
    ON public.notificacoes 
    FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 17. POLÍTICAS RLS - SOLICITAÇÕES DE TESTE
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own trial requests" ON public.solicitacoes_teste;
CREATE POLICY "Users can view their own trial requests" 
    ON public.solicitacoes_teste 
    FOR SELECT 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can create their own trial requests" ON public.solicitacoes_teste;
CREATE POLICY "Users can create their own trial requests" 
    ON public.solicitacoes_teste 
    FOR INSERT 
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can view all trial requests" ON public.solicitacoes_teste;
CREATE POLICY "Admins can view all trial requests" 
    ON public.solicitacoes_teste 
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update trial requests" ON public.solicitacoes_teste;
CREATE POLICY "Admins can update trial requests" 
    ON public.solicitacoes_teste 
    FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 18. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nome_completo, telefone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email),
        NEW.raw_user_meta_data ->> 'telefone'
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'cliente');
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 19. INSERIR PLANOS INICIAIS (OPCIONAL)
-- =====================================================
INSERT INTO public.planos (nome, nome_comercial, descricao, preco, duracao_dias, recursos, ativo)
VALUES 
    ('basico', 'Plano Básico', 'Acesso básico à plataforma', 29.90, 30, '["1 conexão", "Suporte básico"]'::jsonb, TRUE),
    ('padrao', 'Plano Padrão', 'Acesso padrão com mais recursos', 49.90, 30, '["2 conexões", "Suporte prioritário"]'::jsonb, TRUE),
    ('premium', 'Plano Premium', 'Acesso completo com todos os recursos', 79.90, 30, '["4 conexões", "Suporte VIP", "Conteúdo exclusivo"]'::jsonb, TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SCRIPT CONCLUÍDO
-- =====================================================
-- Após executar este script:
-- 1. Crie um usuário no Authentication do Supabase
-- 2. Para torná-lo admin, execute:
--    INSERT INTO public.user_roles (user_id, role) 
--    VALUES ('UUID-DO-USUARIO', 'admin');
-- =====================================================
