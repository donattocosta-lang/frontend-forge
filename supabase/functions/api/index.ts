import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Use external Supabase credentials
const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || "";
const supabaseAnonKey = Deno.env.get("EXTERNAL_SUPABASE_ANON_KEY") || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/api", "");
    const method = req.method;
    
    console.log(`[API] ${method} ${path}`);

    // Get auth token from header
    const authHeader = req.headers.get("authorization");
    let currentUser = null;
    let currentUserData = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      if (!error && user) {
        currentUser = user;
        // Get user data from usuarios table
        const { data: userData } = await supabaseAdmin
          .from("usuarios")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (userData) {
          // Get user role
          const { data: roleData } = await supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single();
          
          currentUserData = {
            ...userData,
            role: roleData?.role || "cliente"
          };
        }
      }
    }

    // Helper functions
    const requireAuth = () => {
      if (!currentUser || !currentUserData) {
        throw { status: 401, message: "Token não fornecido ou inválido" };
      }
      return currentUserData;
    };

    const requireAdmin = () => {
      const user = requireAuth();
      if (user.role !== "admin") {
        throw { status: 403, message: "Acesso negado. Apenas administradores." };
      }
      return user;
    };

    const getBody = async () => {
      try {
        return await req.json();
      } catch {
        return {};
      }
    };

    // ==========================================
    // ROUTING
    // ==========================================

    // AUTH ROUTES
    if (path === "/auth/register" && method === "POST") {
      const { email, senha, nome_completo, telefone } = await getBody();

      if (!email || !senha || !nome_completo) {
        return jsonResponse({ error: "Email, senha e nome completo são obrigatórios" }, 400);
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true
      });

      if (authError) {
        console.error("Auth error:", authError);
        return jsonResponse({ error: authError.message }, 400);
      }

      const { data: userData, error: userError } = await supabaseAdmin
        .from("usuarios")
        .insert({
          id: authData.user.id,
          email,
          nome_completo,
          telefone,
          status: "ativa",
          role: "cliente"
        })
        .select()
        .single();

      if (userError) {
        console.error("User creation error:", userError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return jsonResponse({ error: "Erro ao criar usuário" }, 400);
      }

      await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "cliente"
        });

      return jsonResponse({ message: "Usuário criado com sucesso", user: userData }, 201);
    }

    if (path === "/auth/login" && method === "POST") {
      const { email, senha } = await getBody();

      if (!email || !senha) {
        return jsonResponse({ error: "Email e senha são obrigatórios" }, 400);
      }

      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email,
        password: senha
      });

      if (authError) {
        return jsonResponse({ error: "Credenciais inválidas" }, 401);
      }

      let userData = null;
      const { data: existingUser, error: userError } = await supabaseAdmin
        .from("usuarios")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (userError || !existingUser) {
        const { data: newUser } = await supabaseAdmin
          .from("usuarios")
          .insert({
            id: authData.user.id,
            email,
            nome_completo: email.split("@")[0],
            status: "ativa",
            role: "cliente"
          })
          .select()
          .single();
        userData = { ...newUser, role: "cliente" };
      } else {
        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id)
          .maybeSingle();

        userData = {
          ...existingUser,
          role: roleData?.role === "admin" ? "administrador" : "cliente"
        };
      }

      return jsonResponse({
        token: authData.session.access_token,
        user: userData
      });
    }

    if (path === "/auth/profile" && method === "PUT") {
      const user = requireAuth();
      const { nome_completo, telefone } = await getBody();

      const { data, error } = await supabaseAdmin
        .from("usuarios")
        .update({ nome_completo, telefone, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        return jsonResponse({ error: "Erro ao atualizar perfil" }, 400);
      }

      return jsonResponse({ message: "Perfil atualizado com sucesso", user: data });
    }

    if (path === "/auth/change-password" && method === "PUT") {
      const user = requireAuth();
      const { senha_atual, nova_senha } = await getBody();

      const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
        email: user.email,
        password: senha_atual
      });

      if (verifyError) {
        return jsonResponse({ error: "Senha atual incorreta" }, 400);
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: nova_senha }
      );

      if (updateError) {
        return jsonResponse({ error: "Erro ao alterar senha" }, 400);
      }

      return jsonResponse({ message: "Senha alterada com sucesso" });
    }

    // PLANOS ROUTES
    if (path === "/planos" && method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("planos")
        .select("*")
        .eq("ativo", true)
        .order("preco", { ascending: true });

      if (error) {
        return jsonResponse({ error: "Erro ao buscar planos" }, 500);
      }

      return jsonResponse(data || []);
    }

    if (path === "/admin/planos" && method === "GET") {
      requireAdmin();
      const { data, error } = await supabaseAdmin
        .from("planos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return jsonResponse({ error: "Erro ao buscar planos" }, 500);
      }

      return jsonResponse(data || []);
    }

    if (path === "/admin/planos" && method === "POST") {
      requireAdmin();
      const body = await getBody();

      const { data, error } = await supabaseAdmin
        .from("planos")
        .insert({
          nome: body.nome,
          nome_comercial: body.nome_comercial || body.nome,
          descricao: body.descricao,
          preco: body.preco,
          duracao_dias: body.duracao_dias,
          recursos: body.recursos,
          ativo: body.ativo !== false
        })
        .select()
        .single();

      if (error) {
        console.error("Create plan error:", error);
        return jsonResponse({ error: "Erro ao criar plano" }, 400);
      }

      return jsonResponse(data, 201);
    }

    if (path.match(/^\/admin\/planos\/[\w-]+$/) && method === "PUT") {
      requireAdmin();
      const id = path.split("/").pop();
      const body = await getBody();

      const { data, error } = await supabaseAdmin
        .from("planos")
        .update({
          nome: body.nome,
          nome_comercial: body.nome_comercial,
          descricao: body.descricao,
          preco: body.preco,
          duracao_dias: body.duracao_dias,
          recursos: body.recursos,
          ativo: body.ativo,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return jsonResponse({ error: "Erro ao atualizar plano" }, 400);
      }

      return jsonResponse(data);
    }

    // PEDIDOS ROUTES
    if (path === "/pedidos" && method === "POST") {
      const user = requireAuth();
      const { plano_id } = await getBody();

      const { data: plano, error: planoError } = await supabaseAdmin
        .from("planos")
        .select("*")
        .eq("id", plano_id)
        .eq("ativo", true)
        .single();

      if (planoError || !plano) {
        return jsonResponse({ error: "Plano não encontrado" }, 404);
      }

      const { data: pedido, error: pedidoError } = await supabaseAdmin
        .from("pedidos")
        .insert({
          usuario_id: user.id,
          plano_id,
          valor: plano.preco,
          status_pagamento: "aguardando_pagamento",
          status_acesso: "inativo"
        })
        .select()
        .single();

      if (pedidoError) {
        console.error("Create order error:", pedidoError);
        return jsonResponse({ error: "Erro ao criar pedido" }, 400);
      }

      return jsonResponse({
        ...pedido,
        plano_nome: plano.nome_comercial,
        payment_link: `https://mercadopago.com/checkout/${pedido.id}`
      }, 201);
    }

    if (path === "/pedidos" && method === "GET") {
      const user = requireAuth();

      const { data, error } = await supabaseAdmin
        .from("pedidos")
        .select(`*, planos (nome_comercial)`)
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        return jsonResponse({ error: "Erro ao buscar pedidos" }, 500);
      }

      const formattedData = (data || []).map(pedido => ({
        ...pedido,
        plano_nome: pedido.planos?.nome_comercial,
        data_compra: pedido.created_at
      }));

      return jsonResponse(formattedData);
    }

    if (path.match(/^\/pedidos\/[\w-]+$/) && method === "GET") {
      const user = requireAuth();
      const id = path.split("/").pop();

      const { data, error } = await supabaseAdmin
        .from("pedidos")
        .select(`*, planos (nome_comercial, descricao)`)
        .eq("id", id)
        .eq("usuario_id", user.id)
        .single();

      if (error || !data) {
        return jsonResponse({ error: "Pedido não encontrado" }, 404);
      }

      return jsonResponse({
        ...data,
        plano_nome: data.planos?.nome_comercial,
        plano_descricao: data.planos?.descricao
      });
    }

    if (path === "/admin/pedidos" && method === "GET") {
      requireAdmin();
      const statusPagamento = url.searchParams.get("status_pagamento");
      const statusAcesso = url.searchParams.get("status_acesso");

      let query = supabaseAdmin
        .from("pedidos")
        .select(`*, usuarios (nome_completo, email), planos (nome_comercial)`)
        .order("created_at", { ascending: false });

      if (statusPagamento) {
        query = query.eq("status_pagamento", statusPagamento);
      }
      if (statusAcesso) {
        query = query.eq("status_acesso", statusAcesso);
      }

      const { data, error } = await query;

      if (error) {
        return jsonResponse({ error: "Erro ao buscar pedidos" }, 500);
      }

      const formattedData = (data || []).map(pedido => ({
        ...pedido,
        cliente_nome: pedido.usuarios?.nome_completo,
        cliente_email: pedido.usuarios?.email,
        plano_nome: pedido.planos?.nome_comercial,
        data_compra: pedido.created_at
      }));

      return jsonResponse(formattedData);
    }

    if (path.match(/^\/admin\/pedidos\/[\w-]+$/) && method === "PUT") {
      requireAdmin();
      const id = path.split("/").pop();
      const { status_acesso, observacoes_admin } = await getBody();

      const updateData: any = { updated_at: new Date().toISOString() };
      if (status_acesso) updateData.status_acesso = status_acesso;
      if (observacoes_admin !== undefined) updateData.observacoes_admin = observacoes_admin;

      const { data, error } = await supabaseAdmin
        .from("pedidos")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return jsonResponse({ error: "Erro ao atualizar pedido" }, 400);
      }

      return jsonResponse(data);
    }

    // SOLICITAÇÕES DE TESTE ROUTES
    if (path === "/solicitacoes-teste" && method === "GET") {
      const user = requireAuth();

      const { data, error } = await supabaseAdmin
        .from("solicitacoes_teste")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        return jsonResponse({ error: "Erro ao buscar solicitações" }, 500);
      }

      return jsonResponse(data || []);
    }

    if (path === "/solicitacoes-teste" && method === "POST") {
      const user = requireAuth();
      const { observacoes } = await getBody();

      const { data: existingRequest } = await supabaseAdmin
        .from("solicitacoes_teste")
        .select("*")
        .eq("usuario_id", user.id)
        .in("status", ["pendente", "aprovado"])
        .maybeSingle();

      if (existingRequest) {
        return jsonResponse({
          error: existingRequest.status === "pendente"
            ? "Você já possui uma solicitação pendente"
            : "Você já possui um teste aprovado"
        }, 400);
      }

      const { data, error } = await supabaseAdmin
        .from("solicitacoes_teste")
        .insert({
          usuario_id: user.id,
          observacoes,
          status: "pendente"
        })
        .select()
        .single();

      if (error) {
        console.error("Create trial request error:", error);
        return jsonResponse({ error: "Erro ao criar solicitação" }, 400);
      }

      return jsonResponse({ message: "Solicitação de teste grátis criada com sucesso", solicitacao: data }, 201);
    }

    if (path === "/admin/solicitacoes-teste" && method === "GET") {
      requireAdmin();
      const status = url.searchParams.get("status");

      let query = supabaseAdmin
        .from("solicitacoes_teste")
        .select(`*, usuarios (nome_completo, email, telefone)`)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        return jsonResponse({ error: "Erro ao buscar solicitações" }, 500);
      }

      const formattedData = (data || []).map(solicitacao => ({
        ...solicitacao,
        usuario_nome: solicitacao.usuarios?.nome_completo,
        usuario_email: solicitacao.usuarios?.email,
        usuario_telefone: solicitacao.usuarios?.telefone
      }));

      return jsonResponse(formattedData);
    }

    if (path.match(/^\/admin\/solicitacoes-teste\/[\w-]+$/) && method === "PUT") {
      const adminUser = requireAdmin();
      const id = path.split("/").pop();
      const { status, observacoes_admin } = await getBody();

      if (!["aprovado", "rejeitado"].includes(status)) {
        return jsonResponse({ error: "Status inválido" }, 400);
      }

      const updateData: any = {
        status,
        observacoes_admin,
        updated_at: new Date().toISOString()
      };

      if (status === "aprovado") {
        updateData.aprovado_por = adminUser.id;
        updateData.aprovado_em = new Date().toISOString();
      }

      const { data, error } = await supabaseAdmin
        .from("solicitacoes_teste")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return jsonResponse({ error: "Erro ao processar solicitação" }, 400);
      }

      // Create notification
      const { data: solicitacao } = await supabaseAdmin
        .from("solicitacoes_teste")
        .select("usuario_id")
        .eq("id", id)
        .single();

      if (solicitacao) {
        await supabaseAdmin
          .from("notificacoes")
          .insert({
            usuario_id: solicitacao.usuario_id,
            titulo: status === "aprovado" ? "Teste Grátis Aprovado!" : "Solicitação de Teste Rejeitada",
            mensagem: status === "aprovado"
              ? "Sua solicitação de teste grátis foi aprovada. Aproveite!"
              : `Sua solicitação foi rejeitada. ${observacoes_admin || ""}`,
            tipo: status === "aprovado" ? "sucesso" : "info"
          });
      }

      return jsonResponse({
        message: `Solicitação ${status === "aprovado" ? "aprovada" : "rejeitada"} com sucesso`,
        solicitacao: data
      });
    }

    // NOTIFICAÇÕES ROUTES
    if (path === "/notificacoes" && method === "GET") {
      const user = requireAuth();

      const { data, error } = await supabaseAdmin
        .from("notificacoes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        return jsonResponse({ error: "Erro ao buscar notificações" }, 500);
      }

      return jsonResponse(data || []);
    }

    if (path.match(/^\/notificacoes\/[\w-]+\/lida$/) && method === "PUT") {
      const user = requireAuth();
      const id = path.split("/")[2];

      const { data, error } = await supabaseAdmin
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", id)
        .eq("usuario_id", user.id)
        .select()
        .single();

      if (error) {
        return jsonResponse({ error: "Erro ao marcar notificação como lida" }, 400);
      }

      return jsonResponse(data);
    }

    // ADMIN USERS ROUTES
    if (path === "/admin/usuarios" && method === "GET") {
      requireAdmin();
      const status = url.searchParams.get("status");
      const search = url.searchParams.get("search");

      let query = supabaseAdmin
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      if (search) {
        query = query.or(`nome_completo.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return jsonResponse({ error: "Erro ao buscar usuários" }, 500);
      }

      return jsonResponse(data || []);
    }

    if (path.match(/^\/admin\/usuarios\/[\w-]+$/) && method === "GET") {
      requireAdmin();
      const id = path.split("/").pop();

      const { data: usuario, error } = await supabaseAdmin
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !usuario) {
        return jsonResponse({ error: "Usuário não encontrado" }, 404);
      }

      const { data: pedidos } = await supabaseAdmin
        .from("pedidos")
        .select("*")
        .eq("usuario_id", id)
        .order("created_at", { ascending: false });

      const { data: solicitacoes } = await supabaseAdmin
        .from("solicitacoes_teste")
        .select("*")
        .eq("usuario_id", id)
        .order("created_at", { ascending: false });

      return jsonResponse({
        ...usuario,
        pedidos: pedidos || [],
        solicitacoes_teste: solicitacoes || []
      });
    }

    if (path.match(/^\/admin\/usuarios\/[\w-]+$/) && method === "PUT") {
      requireAdmin();
      const id = path.split("/").pop();
      const { nome_completo, telefone, status } = await getBody();

      const updateData: any = { updated_at: new Date().toISOString() };
      if (nome_completo) updateData.nome_completo = nome_completo;
      if (telefone !== undefined) updateData.telefone = telefone;
      if (status) updateData.status = status;

      const { data, error } = await supabaseAdmin
        .from("usuarios")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return jsonResponse({ error: "Erro ao atualizar usuário" }, 400);
      }

      return jsonResponse(data);
    }

    // ADMIN STATISTICS
    if (path === "/admin/estatisticas" && method === "GET") {
      requireAdmin();

      const { count: totalUsers } = await supabaseAdmin
        .from("usuarios")
        .select("*", { count: "exact", head: true });

      const { count: activeUsers } = await supabaseAdmin
        .from("usuarios")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativa");

      const { count: totalOrders } = await supabaseAdmin
        .from("pedidos")
        .select("*", { count: "exact", head: true });

      const { count: paidOrders } = await supabaseAdmin
        .from("pedidos")
        .select("*", { count: "exact", head: true })
        .eq("status_pagamento", "pago");

      const { count: pendingTrials } = await supabaseAdmin
        .from("solicitacoes_teste")
        .select("*", { count: "exact", head: true })
        .eq("status", "pendente");

      const { count: pendingAccess } = await supabaseAdmin
        .from("pedidos")
        .select("*", { count: "exact", head: true })
        .eq("status_acesso", "pendente");

      const { data: revenueData } = await supabaseAdmin
        .from("pedidos")
        .select("valor")
        .eq("status_pagamento", "pago");

      const totalRevenue = (revenueData || []).reduce((sum, order) => sum + (order.valor || 0), 0);

      return jsonResponse({
        total_vendas: totalOrders || 0,
        receita_total: totalRevenue,
        pagamentos_pendentes: (totalOrders || 0) - (paidOrders || 0),
        acessos_pendentes: pendingAccess || 0,
        testes_pendentes: pendingTrials || 0,
        usuarios: {
          total: totalUsers || 0,
          ativos: activeUsers || 0
        }
      });
    }

    // HEALTH CHECK
    if (path === "/health" && method === "GET") {
      return jsonResponse({ status: "ok", timestamp: new Date().toISOString() });
    }

    // 404 Not Found
    return jsonResponse({ error: "Rota não encontrada" }, 404);

  } catch (error: any) {
    console.error("API Error:", error);
    const status = error.status || 500;
    const message = error.message || "Erro interno do servidor";
    return jsonResponse({ error: message }, status);
  }
});

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
