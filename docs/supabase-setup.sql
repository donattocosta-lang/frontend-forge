-- =====================================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO DO SUPABASE
-- Plataforma de Revenda IPTV
-- =====================================================
-- Execute este script no SQL Editor do seu Supabase
-- Este script é idempotente (pode ser executado múltiplas vezes)
-- =====================================================

-- =====================================================
-- 1. CRIAR ENUM DE ROLES (SE NÃO EXISTIR)
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'cliente');
    END IF;
END $$;

-- =====================================================
-- 2. TABELA: usuarios
-- Armazena informações do perfil dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    nome_completo TEXT NOT NULL,
    telefone TEXT,
    role TEXT NOT NULL DEFAULT 'cliente',
    status TEXT NOT NULL DEFAULT 'ativa',
    email_verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'email') THEN
        ALTER TABLE public.usuarios ADD COLUMN email TEXT NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'nome_completo') THEN
        ALTER TABLE public.usuarios ADD COLUMN nome_completo TEXT NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'telefone') THEN
        ALTER TABLE public.usuarios ADD COLUMN telefone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'role') THEN
        ALTER TABLE public.usuarios ADD COLUMN role TEXT NOT NULL DEFAULT 'cliente';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'status') THEN
        ALTER TABLE public.usuarios ADD COLUMN status TEXT NOT NULL DEFAULT 'ativa';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'email_verificado') THEN
        ALTER TABLE public.usuarios ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'created_at') THEN
        ALTER TABLE public.usuarios ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'updated_at') THEN
        ALTER TABLE public.usuarios ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Criar índice único para email (se não existir)
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_unique ON public.usuarios(email);

-- =====================================================
-- 3. TABELA: user_roles
-- Armazena as roles dos usuários (admin, cliente)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role public.app_role NOT NULL DEFAULT 'cliente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'user_id') THEN
        ALTER TABLE public.user_roles ADD COLUMN user_id UUID NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'role') THEN
        ALTER TABLE public.user_roles ADD COLUMN role public.app_role NOT NULL DEFAULT 'cliente';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'created_at') THEN
        ALTER TABLE public.user_roles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Criar índice único para user_id + role
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_role_unique ON public.user_roles(user_id, role);

-- =====================================================
-- 4. TABELA: planos
-- Armazena os planos disponíveis para venda
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

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'nome') THEN
        ALTER TABLE public.planos ADD COLUMN nome TEXT NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'nome_comercial') THEN
        ALTER TABLE public.planos ADD COLUMN nome_comercial TEXT NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'descricao') THEN
        ALTER TABLE public.planos ADD COLUMN descricao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'preco') THEN
        ALTER TABLE public.planos ADD COLUMN preco NUMERIC NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'duracao_dias') THEN
        ALTER TABLE public.planos ADD COLUMN duracao_dias INTEGER NOT NULL DEFAULT 30;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'recursos') THEN
        ALTER TABLE public.planos ADD COLUMN recursos JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'ativo') THEN
        ALTER TABLE public.planos ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'status') THEN
        ALTER TABLE public.planos ADD COLUMN status TEXT NOT NULL DEFAULT 'ativo';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'created_at') THEN
        ALTER TABLE public.planos ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'planos' AND column_name = 'updated_at') THEN
        ALTER TABLE public.planos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 5. TABELA: pedidos
-- Armazena os pedidos/compras dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    plano_id UUID NOT NULL,
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

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'usuario_id') THEN
        ALTER TABLE public.pedidos ADD COLUMN usuario_id UUID NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'plano_id') THEN
        ALTER TABLE public.pedidos ADD COLUMN plano_id UUID NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'valor') THEN
        ALTER TABLE public.pedidos ADD COLUMN valor NUMERIC NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'status_pagamento') THEN
        ALTER TABLE public.pedidos ADD COLUMN status_pagamento TEXT NOT NULL DEFAULT 'aguardando_pagamento';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'status_acesso') THEN
        ALTER TABLE public.pedidos ADD COLUMN status_acesso TEXT NOT NULL DEFAULT 'inativo';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'data_expiracao') THEN
        ALTER TABLE public.pedidos ADD COLUMN data_expiracao TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'mercadopago_preference_id') THEN
        ALTER TABLE public.pedidos ADD COLUMN mercadopago_preference_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'mercadopago_payment_id') THEN
        ALTER TABLE public.pedidos ADD COLUMN mercadopago_payment_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'observacoes_admin') THEN
        ALTER TABLE public.pedidos ADD COLUMN observacoes_admin TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'created_at') THEN
        ALTER TABLE public.pedidos ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'updated_at') THEN
        ALTER TABLE public.pedidos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 6. TABELA: notificacoes
-- Armazena notificações dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'info',
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notificacoes' AND column_name = 'usuario_id') THEN
        ALTER TABLE public.notificacoes ADD COLUMN usuario_id UUID NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notificacoes' AND column_name = 'titulo') THEN
        ALTER TABLE public.notificacoes ADD COLUMN titulo TEXT NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notificacoes' AND column_name = 'mensagem') THEN
        ALTER TABLE public.notificacoes ADD COLUMN mensagem TEXT NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notificacoes' AND column_name = 'tipo') THEN
        ALTER TABLE public.notificacoes ADD COLUMN tipo TEXT NOT NULL DEFAULT 'info';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notificacoes' AND column_name = 'lida') THEN
        ALTER TABLE public.notificacoes ADD COLUMN lida BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notificacoes' AND column_name = 'created_at') THEN
        ALTER TABLE public.notificacoes ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 7. TABELA: solicitacoes_teste
-- Armazena solicitações de teste grátis
-- =====================================================
CREATE TABLE IF NOT EXISTS public.solicitacoes_teste (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    observacoes TEXT,
    observacoes_admin TEXT,
    aprovado_por UUID,
    aprovado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'solicitacoes_teste' AND column_name = 'usuario_id') THEN
        ALTER TABLE public.solicitacoes_teste ADD COLUMN usuario_id UUID NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'solicitacoes_teste' AND column_name = 'status') THEN
        ALTER TABLE public.solicitacoes_teste ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'solicitacoes_teste' AND column_name = 'observacoes') THEN
        ALTER TABLE public.solicitacoes_teste ADD COLUMN observacoes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'solicitacoes_teste' AND column_name = 'observacoes_admin') THEN
        ALTER TABLE public.solicitacoes_teste ADD COLUMN observacoes_admin TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'solicitacoes_teste' AND column_name = 'aprovado_por') THEN
        ALTER TABLE public.solicitacoes_teste ADD COLUMN aprovado_por UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'solicitacoes_teste' AND column_name = 'aprovado_em') THEN
        ALTER TABLE public.solicitacoes_teste ADD COLUMN aprovado_em TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'solicitacoes_teste' AND column_name = 'created_at') THEN
        ALTER TABLE public.solicitacoes_teste ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'solicitacoes_teste' AND column_name = 'updated_at') THEN
        ALTER TABLE public.solicitacoes_teste ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 8. TABELA: iptv_playlists
-- Armazena playlists M3U de IPTV por usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS public.iptv_playlists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    nome TEXT NOT NULL DEFAULT 'Playlist Principal',
    url_m3u TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iptv_playlists' AND column_name = 'usuario_id') THEN
        ALTER TABLE public.iptv_playlists ADD COLUMN usuario_id UUID NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iptv_playlists' AND column_name = 'nome') THEN
        ALTER TABLE public.iptv_playlists ADD COLUMN nome TEXT NOT NULL DEFAULT 'Playlist Principal';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iptv_playlists' AND column_name = 'url_m3u') THEN
        ALTER TABLE public.iptv_playlists ADD COLUMN url_m3u TEXT NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iptv_playlists' AND column_name = 'ativo') THEN
        ALTER TABLE public.iptv_playlists ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iptv_playlists' AND column_name = 'created_at') THEN
        ALTER TABLE public.iptv_playlists ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iptv_playlists' AND column_name = 'updated_at') THEN
        ALTER TABLE public.iptv_playlists ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Criar índice único para usuario_id + url_m3u
CREATE UNIQUE INDEX IF NOT EXISTS iptv_playlists_usuario_url_unique ON public.iptv_playlists(usuario_id, url_m3u);

-- =====================================================
-- 9. ADICIONAR FOREIGN KEYS (SE NÃO EXISTIREM)
-- =====================================================
DO $$
BEGIN
    -- user_roles -> auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_fkey' AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE public.user_roles 
        ADD CONSTRAINT user_roles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- pedidos -> usuarios
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pedidos_usuario_id_fkey' AND table_name = 'pedidos'
    ) THEN
        ALTER TABLE public.pedidos 
        ADD CONSTRAINT pedidos_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    END IF;

    -- pedidos -> planos
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pedidos_plano_id_fkey' AND table_name = 'pedidos'
    ) THEN
        ALTER TABLE public.pedidos 
        ADD CONSTRAINT pedidos_plano_id_fkey 
        FOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE RESTRICT;
    END IF;

    -- notificacoes -> usuarios
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notificacoes_usuario_id_fkey' AND table_name = 'notificacoes'
    ) THEN
        ALTER TABLE public.notificacoes 
        ADD CONSTRAINT notificacoes_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    END IF;

    -- solicitacoes_teste -> usuarios
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'solicitacoes_teste_usuario_id_fkey' AND table_name = 'solicitacoes_teste'
    ) THEN
        ALTER TABLE public.solicitacoes_teste 
        ADD CONSTRAINT solicitacoes_teste_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    END IF;

    -- iptv_playlists -> auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'iptv_playlists_usuario_id_fkey' AND table_name = 'iptv_playlists'
    ) THEN
        ALTER TABLE public.iptv_playlists 
        ADD CONSTRAINT iptv_playlists_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 9. CRIAR FUNÇÃO has_role (VERIFICAÇÃO DE ROLE)
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
-- 10. CRIAR FUNÇÃO update_updated_at_column
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
-- 11. CRIAR TRIGGERS DE UPDATED_AT
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

DROP TRIGGER IF EXISTS update_iptv_playlists_updated_at ON public.iptv_playlists;
CREATE TRIGGER update_iptv_playlists_updated_at
    BEFORE UPDATE ON public.iptv_playlists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 13. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_teste ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iptv_playlists ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 13. POLÍTICAS RLS - USUÁRIOS
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
CREATE POLICY "Users can view their own profile" 
    ON public.usuarios FOR SELECT 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.usuarios;
CREATE POLICY "Users can insert their own profile" 
    ON public.usuarios FOR INSERT 
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.usuarios;
CREATE POLICY "Users can update their own profile" 
    ON public.usuarios FOR UPDATE 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.usuarios;
CREATE POLICY "Admins can view all users" 
    ON public.usuarios FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all users" ON public.usuarios;
CREATE POLICY "Admins can update all users" 
    ON public.usuarios FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 14. POLÍTICAS RLS - USER_ROLES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role" 
    ON public.user_roles FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" 
    ON public.user_roles FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" 
    ON public.user_roles FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" 
    ON public.user_roles FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 15. POLÍTICAS RLS - PLANOS
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.planos;
CREATE POLICY "Anyone can view active plans" 
    ON public.planos FOR SELECT 
    USING (ativo = TRUE);

DROP POLICY IF EXISTS "Admins can manage all plans" ON public.planos;
CREATE POLICY "Admins can manage all plans" 
    ON public.planos FOR ALL 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 16. POLÍTICAS RLS - PEDIDOS
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own orders" ON public.pedidos;
CREATE POLICY "Users can view their own orders" 
    ON public.pedidos FOR SELECT 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can create their own orders" ON public.pedidos;
CREATE POLICY "Users can create their own orders" 
    ON public.pedidos FOR INSERT 
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON public.pedidos;
CREATE POLICY "Admins can view all orders" 
    ON public.pedidos FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all orders" ON public.pedidos;
CREATE POLICY "Admins can update all orders" 
    ON public.pedidos FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 17. POLÍTICAS RLS - NOTIFICAÇÕES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notificacoes;
CREATE POLICY "Users can view their own notifications" 
    ON public.notificacoes FOR SELECT 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notificacoes;
CREATE POLICY "Users can update their own notifications" 
    ON public.notificacoes FOR UPDATE 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notificacoes;
CREATE POLICY "Admins can create notifications" 
    ON public.notificacoes FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 18. POLÍTICAS RLS - SOLICITAÇÕES DE TESTE
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own trial requests" ON public.solicitacoes_teste;
CREATE POLICY "Users can view their own trial requests" 
    ON public.solicitacoes_teste FOR SELECT 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can create their own trial requests" ON public.solicitacoes_teste;
CREATE POLICY "Users can create their own trial requests" 
    ON public.solicitacoes_teste FOR INSERT 
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can view all trial requests" ON public.solicitacoes_teste;
CREATE POLICY "Admins can view all trial requests" 
    ON public.solicitacoes_teste FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update trial requests" ON public.solicitacoes_teste;
CREATE POLICY "Admins can update trial requests" 
    ON public.solicitacoes_teste FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 19. POLÍTICAS RLS - IPTV PLAYLISTS
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own playlists" ON public.iptv_playlists;
CREATE POLICY "Users can view their own playlists" 
    ON public.iptv_playlists FOR SELECT 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can view all playlists" ON public.iptv_playlists;
CREATE POLICY "Admins can view all playlists" 
    ON public.iptv_playlists FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert playlists" ON public.iptv_playlists;
CREATE POLICY "Admins can insert playlists" 
    ON public.iptv_playlists FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update playlists" ON public.iptv_playlists;
CREATE POLICY "Admins can update playlists" 
    ON public.iptv_playlists FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete playlists" ON public.iptv_playlists;
CREATE POLICY "Admins can delete playlists" 
    ON public.iptv_playlists FOR DELETE 
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 19. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- Cria ou atualiza o perfil do usuário quando ele se registra
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Inserir ou atualizar na tabela de usuários
    INSERT INTO public.usuarios (id, email, nome_completo, telefone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data ->> 'telefone'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nome_completo = COALESCE(EXCLUDED.nome_completo, public.usuarios.nome_completo),
        telefone = COALESCE(EXCLUDED.telefone, public.usuarios.telefone);
    
    -- Inserir role padrão de cliente (ignorar se já existir)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'cliente')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir e criar novo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 20. INSERIR PLANOS INICIAIS (OPCIONAL)
-- =====================================================
INSERT INTO public.planos (nome, nome_comercial, descricao, preco, duracao_dias, recursos, ativo)
VALUES 
    ('basico', 'Plano Básico', 'Acesso básico à plataforma com recursos essenciais', 29.90, 30, '["1 conexão simultânea", "Suporte por email", "Acesso ao catálogo básico"]'::jsonb, TRUE),
    ('padrao', 'Plano Padrão', 'Acesso padrão com mais recursos e benefícios', 49.90, 30, '["2 conexões simultâneas", "Suporte prioritário", "Acesso ao catálogo completo", "Qualidade HD"]'::jsonb, TRUE),
    ('premium', 'Plano Premium', 'Acesso completo com todos os recursos disponíveis', 79.90, 30, '["4 conexões simultâneas", "Suporte VIP 24/7", "Acesso ao catálogo completo", "Qualidade 4K", "Conteúdo exclusivo", "Sem anúncios"]'::jsonb, TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 21. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_id ON public.pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_plano_id ON public.pedidos(plano_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status_pagamento ON public.pedidos(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON public.notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_teste_usuario_id ON public.solicitacoes_teste(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_teste_status ON public.solicitacoes_teste(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_teste_created_at ON public.solicitacoes_teste(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

CREATE INDEX IF NOT EXISTS idx_planos_ativo ON public.planos(ativo);
CREATE INDEX IF NOT EXISTS idx_planos_status ON public.planos(status);

CREATE INDEX IF NOT EXISTS idx_iptv_playlists_usuario_id ON public.iptv_playlists(usuario_id);
CREATE INDEX IF NOT EXISTS idx_iptv_playlists_ativo ON public.iptv_playlists(ativo);
CREATE INDEX IF NOT EXISTS idx_iptv_playlists_created_at ON public.iptv_playlists(created_at DESC);

-- =====================================================
-- 22. POLÍTICAS RLS PARA SERVICE ROLE (EDGE FUNCTIONS)
-- Permite que Edge Functions atualizem pedidos via webhook
-- =====================================================
DROP POLICY IF EXISTS "Service role can update orders" ON public.pedidos;
CREATE POLICY "Service role can update orders"
    ON public.pedidos FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notificacoes;
CREATE POLICY "Service role can insert notifications"
    ON public.notificacoes FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- SCRIPT CONCLUÍDO COM SUCESSO!
-- =====================================================
-- 
-- =====================================================
-- PRÓXIMOS PASSOS PARA DEPLOY EXTERNO:
-- =====================================================
--
-- 1. VARIÁVEIS DE AMBIENTE (Frontend - .env ou variáveis do hosting):
--    VITE_SUPABASE_URL=https://seu-projeto.supabase.co
--    VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
--
-- 2. SECRETS DO SUPABASE (Dashboard > Settings > Edge Functions > Secrets):
--    - MERCADOPAGO_ACCESS_TOKEN: Seu Access Token do MercadoPago
--    - MERCADOPAGO_PUBLIC_KEY: Sua Public Key do MercadoPago
--    - SUPABASE_URL: https://seu-projeto.supabase.co
--    - SUPABASE_ANON_KEY: Sua Anon Key do Supabase (usada pelo iptv-proxy)
--    - SUPABASE_SERVICE_ROLE_KEY: Sua Service Role Key do Supabase
--
-- 3. DEPLOY DAS EDGE FUNCTIONS:
--    Copie as pastas de supabase/functions/ para seu projeto:
--    - mercadopago/index.ts         (processa pagamentos)
--    - mercadopago-webhook/index.ts (recebe notificações do MercadoPago)
--    - iptv-proxy/index.ts          (proxy para buscar playlists M3U)
--    
--    Deploy via CLI:
--    $ supabase functions deploy mercadopago
--    $ supabase functions deploy mercadopago-webhook
--    $ supabase functions deploy iptv-proxy --no-verify-jwt
--
-- 4. CONFIGURAR WEBHOOK NO MERCADOPAGO:
--    Acesse: https://www.mercadopago.com.br/developers/panel/app
--    Configure a URL do webhook:
--    https://seu-projeto.supabase.co/functions/v1/mercadopago-webhook
--
-- 5. CRIAR USUÁRIO ADMINISTRADOR:
--    a) Primeiro, crie um usuário normalmente pela aplicação
--    b) Encontre o UUID do usuário:
--       SELECT id, email FROM auth.users;
--    c) Adicione a role de admin:
--       INSERT INTO public.user_roles (user_id, role) 
--       VALUES ('UUID-DO-USUARIO', 'admin')
--       ON CONFLICT (user_id, role) DO NOTHING;
--
-- 6. CONFIGURAR AUTO-CONFIRM EMAIL (Opcional para desenvolvimento):
--    Dashboard > Authentication > Settings > Email Auth
--    Desabilite "Confirm email" para testes
--
-- 7. TESTAR A INTEGRAÇÃO:
--    a) Acesse a aplicação e faça login
--    b) Selecione um plano e vá para checkout
--    c) Use cartões de teste do MercadoPago:
--       - Aprovado: 5031 4332 1540 6351 (CVV: 123, Data: qualquer futura)
--       - Recusado: 5031 4332 1540 6369
--
-- =====================================================
-- ESTRUTURA DAS EDGE FUNCTIONS:
-- =====================================================
--
-- supabase/functions/
-- ├── mercadopago/
-- │   └── index.ts              # Processa pagamentos e retorna public key
-- ├── mercadopago-webhook/
-- │   └── index.ts              # Recebe notificações do MercadoPago
-- └── iptv-proxy/
--     └── index.ts              # Proxy para buscar playlists M3U (evita CORS)
--
-- A função mercadopago suporta as seguintes ações (via query param ?action=):
-- - get-public-key: Retorna a public key do MercadoPago
-- - create-preference: Cria uma preferência de pagamento
-- - process-payment: Processa um pagamento com cartão
--
-- =====================================================
-- EDGE FUNCTION: iptv-proxy
-- =====================================================
--
-- A função iptv-proxy atua como proxy server-side para buscar playlists M3U
-- de provedores IPTV externos, contornando restrições de CORS do navegador.
--
-- CARACTERÍSTICAS:
-- - Valida autenticação JWT do usuário
-- - Verifica se o usuário tem acesso à playlist (tabela iptv_playlists)
-- - Busca a URL M3U armazenada no banco (nunca expõe credenciais ao frontend)
-- - Fallback automático de HTTP para HTTPS se o servidor retornar 404
-- - Timeout de 30 segundos para evitar travamentos
-- - Headers User-Agent para simular navegador (alguns provedores bloqueiam bots)
-- - Logs redactados (senhas/tokens nunca aparecem nos logs)
--
-- USO NO FRONTEND:
-- O componente IPTVPlayer chama via supabase.functions.invoke:
--
--   const { data, error } = await supabase.functions.invoke('iptv-proxy', {
--     body: { playlistId: 'uuid-da-playlist' }
--   });
--
-- PARÂMETROS (POST body ou query string):
-- - playlistId: UUID da playlist (preferido - mais seguro)
-- - url: URL M3U direta (fallback - menos seguro, expõe credenciais na requisição)
--
-- RESPOSTAS:
-- - 200: Conteúdo M3U em text/plain
-- - 400: playlistId ou url não fornecido
-- - 401: Usuário não autenticado
-- - 403: Playlist não encontrada ou usuário sem acesso
-- - 502: Falha ao buscar M3U do provedor (servidor retornou erro)
-- - 504: Timeout ao buscar M3U
--
-- CONFIGURAÇÃO NO config.toml:
-- [functions.iptv-proxy]
-- verify_jwt = false   # JWT é validado manualmente no código
--
-- SEGURANÇA:
-- - A URL M3U (com credenciais) é armazenada apenas no banco de dados
-- - O frontend só envia o playlistId, nunca a URL com senha
-- - Logs nunca expõem username/password (são redactados)
-- - Apenas o dono da playlist pode acessá-la (RLS + verificação no código)
--
-- =====================================================
