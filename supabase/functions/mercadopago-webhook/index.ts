import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Process payment notification
    if (body.type === "payment" && body.data?.id) {
      const paymentId = body.data.id;
      
      console.log(`Fetching payment details for ID: ${paymentId}`);

      // Get payment details from MercadoPago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const paymentData = await paymentResponse.json();
      console.log("Payment data:", paymentData.status, paymentData.external_reference);

      if (paymentData.external_reference) {
        const pedidoId = paymentData.external_reference;
        
        let statusPagamento = "aguardando_pagamento";
        let statusAcesso = "inativo";

        if (paymentData.status === "approved") {
          statusPagamento = "pago";
          statusAcesso = "pendente"; // Pending admin activation
        } else if (paymentData.status === "pending" || paymentData.status === "in_process") {
          statusPagamento = "pendente";
        } else if (paymentData.status === "rejected" || paymentData.status === "cancelled") {
          statusPagamento = "recusado";
        } else if (paymentData.status === "refunded") {
          statusPagamento = "reembolsado";
        }

        // Update pedido
        const { error } = await supabase
          .from("pedidos")
          .update({
            mercadopago_payment_id: String(paymentId),
            status_pagamento: statusPagamento,
            status_acesso: statusAcesso,
          })
          .eq("id", pedidoId);

        if (error) {
          console.error("Error updating pedido:", error);
        } else {
          console.log(`Pedido ${pedidoId} updated successfully`);

          // Create notification for user if payment approved
          if (paymentData.status === "approved") {
            const { data: pedido } = await supabase
              .from("pedidos")
              .select("usuario_id, plano:planos(nome_comercial)")
              .eq("id", pedidoId)
              .single();

            if (pedido) {
              await supabase.from("notificacoes").insert({
                usuario_id: pedido.usuario_id,
                titulo: "Pagamento Confirmado!",
                mensagem: `Seu pagamento para o ${(pedido.plano as any)?.nome_comercial || 'plano'} foi confirmado. Em breve seu acesso será liberado.`,
                tipo: "success",
              });
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
