// =====================================================
// BACKEND API - PLATAFORMA REVENDA IPTV
// Node.js + Express + Supabase
// =====================================================

// ============ server.js ============
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// =====================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// =====================================================
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar dados completos do usuário
    const { data: userData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    // Verificar role do usuário
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    req.user = { ...userData, role: roleData?.role || 'cliente' };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Middleware para verificar se é admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};

// =====================================================
// ROTAS DE AUTENTICAÇÃO
// =====================================================

// Registro de novo usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, senha, nome_completo, telefone } = req.body;

    // Validações
    if (!email || !senha || !nome_completo) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Criar registro na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .insert([
        {
          id: authData.user.id,
          email,
          nome_completo,
          telefone,
          status: 'ativa'
        }
      ])
      .select()
      .single();

    if (userError) {
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    // Criar role de cliente
    await supabase.from('user_roles').insert([{
      user_id: authData.user.id,
      role: 'cliente'
    }]);

    // Log de auditoria
    await supabase.from('logs_auditoria').insert([{
      usuario_id: userData.id,
      acao: 'registro',
      entidade: 'usuarios',
      entidade_id: userData.id,
      ip_address: req.ip
    }]);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: userData.id,
        email: userData.email,
        nome_completo: userData.nome_completo
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Se usuário não existe na tabela, criar
    if (userError || !userData) {
      console.log('Usuário não encontrado na tabela, criando...');
      
      const { data: newUser, error: createError } = await supabase
        .from('usuarios')
        .insert([{
          id: data.user.id,
          email: data.user.email,
          nome_completo: data.user.user_metadata?.nome_completo || data.user.email.split('@')[0],
          telefone: data.user.user_metadata?.telefone || null,
          status: 'ativa',
          email_verificado: data.user.email_confirmed_at ? true : false
        }])
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar usuário na tabela:', createError);
        return res.status(500).json({ error: 'Erro ao sincronizar dados do usuário' });
      }

      // Criar role de cliente
      await supabase.from('user_roles').insert([{
        user_id: data.user.id,
        role: 'cliente'
      }]);

      // Log de auditoria
      await supabase.from('logs_auditoria').insert([{
        usuario_id: newUser.id,
        acao: 'login',
        entidade: 'usuarios',
        entidade_id: newUser.id,
        ip_address: req.ip
      }]);

      return res.json({
        token: data.session.access_token,
        user: newUser
      });
    }

    // Buscar role do usuário
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .single();

    // Log de auditoria
    await supabase.from('logs_auditoria').insert([{
      usuario_id: userData.id,
      acao: 'login',
      entidade: 'usuarios',
      entidade_id: userData.id,
      ip_address: req.ip
    }]);

    res.json({
      token: data.session.access_token,
      user: { ...userData, role: roleData?.role || 'cliente' }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =====================================================
// ROTAS DE PLANOS
// =====================================================

// Listar planos ativos (público)
app.get('/api/planos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('planos')
      .select('id, nome_comercial, descricao, duracao_dias, preco')
      .eq('status', 'ativo')
      .order('ordem_exibicao', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ error: 'Erro ao buscar planos' });
  }
});

// Listar todos os planos (admin)
app.get('/api/admin/planos', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('planos')
      .select('*')
      .order('ordem_exibicao', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar planos' });
  }
});

// Criar plano (admin)
app.post('/api/admin/planos', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nome_comercial, descricao, duracao_dias, preco, observacoes_internas } = req.body;

    const { data, error } = await supabase
      .from('planos')
      .insert([{
        nome_comercial,
        descricao,
        duracao_dias,
        preco,
        observacoes_internas,
        status: 'ativo'
      }])
      .select()
      .single();

    if (error) throw error;

    // Log de auditoria
    await supabase.from('logs_auditoria').insert([{
      usuario_id: req.user.id,
      acao: 'criar_plano',
      entidade: 'planos',
      entidade_id: data.id,
      dados_novos: data
    }]);

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar plano' });
  }
});

// Atualizar plano (admin)
app.put('/api/admin/planos/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Buscar dados anteriores
    const { data: oldData } = await supabase
      .from('planos')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('planos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log de auditoria
    await supabase.from('logs_auditoria').insert([{
      usuario_id: req.user.id,
      acao: 'atualizar_plano',
      entidade: 'planos',
      entidade_id: id,
      dados_anteriores: oldData,
      dados_novos: data
    }]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar plano' });
  }
});

// =====================================================
// ROTAS DE PEDIDOS
// =====================================================

// Criar pedido
app.post('/api/pedidos', authMiddleware, async (req, res) => {
  try {
    const { plano_id } = req.body;

    // Buscar dados do plano
    const { data: plano, error: planoError } = await supabase
      .from('planos')
      .select('*')
      .eq('id', plano_id)
      .eq('status', 'ativo')
      .single();

    if (planoError || !plano) {
      return res.status(404).json({ error: 'Plano não encontrado ou inativo' });
    }

    // Criar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([{
        usuario_id: req.user.id,
        plano_id: plano.id,
        valor: plano.preco,
        plano_nome: plano.nome_comercial,
        plano_duracao_dias: plano.duracao_dias,
        status_pagamento: 'aguardando_pagamento',
        status_acesso: 'pendente'
      }])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // Log de auditoria
    await supabase.from('logs_auditoria').insert([{
      usuario_id: req.user.id,
      acao: 'criar_pedido',
      entidade: 'pedidos',
      entidade_id: pedido.id
    }]);

    res.status(201).json(pedido);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// Listar pedidos do usuário
app.get('/api/pedidos', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('usuario_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Detalhes de um pedido
app.get('/api/pedidos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// =====================================================
// ROTAS ADMINISTRATIVAS - PEDIDOS
// =====================================================

// Listar todos os pedidos (admin)
app.get('/api/admin/pedidos', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status_pagamento, status_acesso } = req.query;

    let query = supabase
      .from('vw_pedidos_completos')
      .select('*')
      .order('created_at', { ascending: false });

    if (status_pagamento) {
      query = query.eq('status_pagamento', status_pagamento);
    }

    if (status_acesso) {
      query = query.eq('status_acesso', status_acesso);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Atualizar status do pedido (admin)
app.put('/api/admin/pedidos/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_acesso, observacoes_admin } = req.body;

    const updates = {
      observacoes_admin
    };

    if (status_acesso) {
      updates.status_acesso = status_acesso;
      if (status_acesso === 'acesso_enviado') {
        updates.credenciais_enviadas_em = new Date().toISOString();
        updates.credenciais_enviadas_por = req.user.id;
      }
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Se acesso foi enviado, notificar cliente
    if (status_acesso === 'acesso_enviado') {
      await supabase.from('notificacoes').insert([{
        usuario_id: data.usuario_id,
        tipo: 'acesso_liberado',
        titulo: 'Acesso IPTV Liberado',
        mensagem: 'Suas credenciais foram enviadas. Verifique seu e-mail.',
        pedido_id: id
      }]);
    }

    // Log de auditoria
    await supabase.from('logs_auditoria').insert([{
      usuario_id: req.user.id,
      acao: 'atualizar_pedido',
      entidade: 'pedidos',
      entidade_id: id,
      dados_novos: updates
    }]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

// =====================================================
// ROTAS DE SOLICITAÇÕES DE TESTE GRÁTIS
// =====================================================

// Verificar se usuário já tem solicitação de teste
app.get('/api/solicitacoes-teste', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitacoes_teste')
      .select('*')
      .eq('usuario_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar solicitações de teste:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitações de teste' });
  }
});

// Criar solicitação de teste grátis (6 horas)
app.post('/api/solicitacoes-teste', authMiddleware, async (req, res) => {
  try {
    const { observacoes } = req.body;

    // Verificar se já existe solicitação pendente ou aprovada
    const { data: existente } = await supabase
      .from('solicitacoes_teste')
      .select('*')
      .eq('usuario_id', req.user.id)
      .in('status', ['pendente', 'aprovado'])
      .maybeSingle();

    if (existente) {
      if (existente.status === 'pendente') {
        return res.status(400).json({ 
          error: 'Você já possui uma solicitação de teste pendente',
          solicitacao: existente 
        });
      }
      if (existente.status === 'aprovado') {
        return res.status(400).json({ 
          error: 'Você já utilizou seu teste grátis',
          solicitacao: existente 
        });
      }
    }

    // Criar nova solicitação
    const { data, error } = await supabase
      .from('solicitacoes_teste')
      .insert([{
        usuario_id: req.user.id,
        observacoes,
        status: 'pendente'
      }])
      .select()
      .single();

    if (error) throw error;

    // Log de auditoria
    await supabase.from('logs_auditoria').insert([{
      usuario_id: req.user.id,
      acao: 'solicitar_teste',
      entidade: 'solicitacoes_teste',
      entidade_id: data.id,
      ip_address: req.ip
    }]);

    // Criar notificação para admins (opcional - depende da estrutura)
    // await supabase.from('notificacoes').insert([{...}]);

    res.status(201).json({
      message: 'Solicitação de teste grátis enviada com sucesso! Você receberá uma resposta em breve.',
      solicitacao: data
    });
  } catch (error) {
    console.error('Erro ao criar solicitação de teste:', error);
    res.status(500).json({ error: 'Erro ao criar solicitação de teste' });
  }
});

// Listar todas as solicitações de teste (admin)
app.get('/api/admin/solicitacoes-teste', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('solicitacoes_teste')
      .select(`
        *,
        usuario:usuarios(id, nome_completo, email, telefone)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar solicitações de teste:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitações de teste' });
  }
});

// Aprovar ou rejeitar solicitação de teste (admin)
app.put('/api/admin/solicitacoes-teste/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes_admin } = req.body;

    if (!['aprovado', 'rejeitado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use: aprovado ou rejeitado' });
    }

    // Buscar solicitação
    const { data: solicitacao, error: findError } = await supabase
      .from('solicitacoes_teste')
      .select('*, usuario:usuarios(id, nome_completo, email)')
      .eq('id', id)
      .single();

    if (findError || !solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    if (solicitacao.status !== 'pendente') {
      return res.status(400).json({ error: 'Esta solicitação já foi processada' });
    }

    // Atualizar solicitação
    const updates = {
      status,
      observacoes_admin,
      aprovado_por: req.user.id,
      aprovado_em: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('solicitacoes_teste')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Criar notificação para o usuário
    const notificacao = {
      usuario_id: solicitacao.usuario_id,
      tipo: status === 'aprovado' ? 'teste_aprovado' : 'teste_rejeitado',
      titulo: status === 'aprovado' 
        ? 'Teste Grátis Aprovado!' 
        : 'Solicitação de Teste',
      mensagem: status === 'aprovado'
        ? 'Seu teste grátis de 6 horas foi aprovado! Você receberá as credenciais em breve.'
        : `Sua solicitação de teste não foi aprovada. ${observacoes_admin || ''}`,
    };

    await supabase.from('notificacoes').insert([notificacao]);

    // Log de auditoria
    await supabase.from('logs_auditoria').insert([{
      usuario_id: req.user.id,
      acao: status === 'aprovado' ? 'aprovar_teste' : 'rejeitar_teste',
      entidade: 'solicitacoes_teste',
      entidade_id: id,
      dados_novos: updates
    }]);

    res.json({
      message: status === 'aprovado' 
        ? 'Teste grátis aprovado com sucesso!' 
        : 'Solicitação rejeitada.',
      solicitacao: data
    });
  } catch (error) {
    console.error('Erro ao processar solicitação de teste:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação de teste' });
  }
});

// =====================================================
// ROTA DE WEBHOOK - MERCADO PAGO
// =====================================================

app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;

      // Buscar detalhes do pagamento no Mercado Pago
      // (Implementar chamada à API do MP aqui)
      
      // Atualizar pedido
      const { data: pedido, error } = await supabase
        .from('pedidos')
        .update({
          status_pagamento: 'pago',
          data_pagamento: new Date().toISOString(),
          mp_payment_id: paymentId,
          mp_status: 'approved'
        })
        .eq('mp_payment_id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar pedido:', error);
      }

      // A trigger do banco já criará a notificação para o admin
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// =====================================================
// ROTAS DE NOTIFICAÇÕES
// =====================================================

// Listar notificações do usuário
app.get('/api/notificacoes', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// Marcar notificação como lida
app.put('/api/notificacoes/:id/lida', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id)
      .eq('usuario_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar notificação' });
  }
});

// =====================================================
// ROTAS DE ESTATÍSTICAS (ADMIN)
// =====================================================

app.get('/api/admin/estatisticas', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vw_estatisticas_vendas')
      .select('*')
      .single();

    if (error) throw error;

    // Adicionar estatísticas de solicitações de teste
    const { data: testesStats } = await supabase
      .from('solicitacoes_teste')
      .select('status');

    const testesPendentes = testesStats?.filter(t => t.status === 'pendente').length || 0;
    const testesAprovados = testesStats?.filter(t => t.status === 'aprovado').length || 0;
    const testesRejeitados = testesStats?.filter(t => t.status === 'rejeitado').length || 0;

    res.json({
      ...data,
      testes: {
        pendentes: testesPendentes,
        aprovados: testesAprovados,
        rejeitados: testesRejeitados,
        total: testesStats?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// =====================================================
// ROTA DE HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
