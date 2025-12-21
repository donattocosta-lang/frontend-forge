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

interface CreatePreferenceRequest {
  pedidoId: string;
  planoNome: string;
  valor: number;
  userEmail: string;
}

interface ProcessPaymentRequest {
  token: string;
  paymentMethodId: string;
  issuerId: string;
  installments: number;
  email: string;
  amount: number;
  pedidoId: string;
  identificationType?: string;
  identificationNumber?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    
    console.log(`Processing action: ${action}`);

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    if (action === "get-public-key") {
      // Return the public key for frontend initialization
      const publicKey = Deno.env.get("MERCADOPAGO_PUBLIC_KEY");
      return new Response(JSON.stringify({ publicKey }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create-preference") {
      const { pedidoId, planoNome, valor, userEmail }: CreatePreferenceRequest = await req.json();
      
      console.log(`Creating preference for pedido ${pedidoId}, plan: ${planoNome}, value: ${valor}`);
      
      const baseUrl = req.headers.get("origin") || "https://fast-iptv.app";
      
      const preference = {
        items: [
          {
            id: pedidoId,
            title: `Fast IPTV - ${planoNome}`,
            description: `Assinatura ${planoNome}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(valor),
          },
        ],
        payer: {
          email: userEmail,
        },
        back_urls: {
          success: `${baseUrl}/pagamento/sucesso?pedido_id=${pedidoId}`,
          failure: `${baseUrl}/pagamento/falha?pedido_id=${pedidoId}`,
          pending: `${baseUrl}/pagamento/pendente?pedido_id=${pedidoId}`,
        },
        auto_return: "approved",
        external_reference: pedidoId,
        notification_url: `${SUPABASE_URL}/functions/v1/mercadopago-webhook`,
      };

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preference),
      });

      const preferenceData = await response.json();
      console.log("Preference created:", preferenceData.id);

      if (!response.ok) {
        console.error("MercadoPago error:", preferenceData);
        throw new Error(preferenceData.message || "Error creating preference");
      }

      // Update pedido with preference id
      const { error: updateError } = await supabase
        .from("pedidos")
        .update({ mercadopago_preference_id: preferenceData.id })
        .eq("id", pedidoId);

      if (updateError) {
        console.error("Error updating pedido:", updateError);
      }

      return new Response(JSON.stringify({ 
        preferenceId: preferenceData.id,
        initPoint: preferenceData.init_point,
        sandboxInitPoint: preferenceData.sandbox_init_point
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "process-payment") {
      const paymentData: ProcessPaymentRequest = await req.json();
      
      console.log(`Processing payment for pedido ${paymentData.pedidoId}`);
      
      const paymentPayload: any = {
        transaction_amount: Number(paymentData.amount),
        token: paymentData.token,
        description: "Fast IPTV - Assinatura",
        installments: Number(paymentData.installments),
        payment_method_id: paymentData.paymentMethodId,
        issuer_id: paymentData.issuerId ? Number(paymentData.issuerId) : undefined,
        payer: {
          email: paymentData.email,
        },
        external_reference: paymentData.pedidoId,
      };

      if (paymentData.identificationType && paymentData.identificationNumber) {
        paymentPayload.payer.identification = {
          type: paymentData.identificationType,
          number: paymentData.identificationNumber,
        };
      }

      const response = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `${paymentData.pedidoId}-${Date.now()}`,
        },
        body: JSON.stringify(paymentPayload),
      });

      const paymentResult = await response.json();
      console.log("Payment result:", paymentResult.status, "Detail:", paymentResult.status_detail);
      console.log("Full payment response:", JSON.stringify(paymentResult));

      if (!response.ok) {
        console.error("Payment error:", paymentResult);
        return new Response(JSON.stringify({ 
          error: true,
          message: paymentResult.message || "Payment processing failed",
          status: paymentResult.status
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update pedido based on payment status
      let statusPagamento = "aguardando_pagamento";
      let statusAcesso = "inativo";

      if (paymentResult.status === "approved") {
        statusPagamento = "pago";
        statusAcesso = "pendente"; // Pending admin activation
      } else if (paymentResult.status === "pending" || paymentResult.status === "in_process") {
        statusPagamento = "pendente";
      } else if (paymentResult.status === "rejected") {
        statusPagamento = "recusado";
      }

      const { error: updateError } = await supabase
        .from("pedidos")
        .update({ 
          mercadopago_payment_id: String(paymentResult.id),
          status_pagamento: statusPagamento,
          status_acesso: statusAcesso,
        })
        .eq("id", paymentData.pedidoId);

      if (updateError) {
        console.error("Error updating pedido:", updateError);
      }

      // Extract PIX data if available
      const pixData = paymentResult.point_of_interaction?.transaction_data;
      
      return new Response(JSON.stringify({ 
        success: true,
        paymentId: paymentResult.id,
        status: paymentResult.status,
        statusDetail: paymentResult.status_detail,
        paymentMethodId: paymentResult.payment_method_id,
        // PIX specific data
        pixQrCode: pixData?.qr_code,
        pixQrCodeBase64: pixData?.qr_code_base64,
        pixTicketUrl: pixData?.ticket_url,
        expirationDate: paymentResult.date_of_expiration,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create-pix") {
      const { amount, pedidoId, email, description } = await req.json();
      
      console.log(`Creating PIX payment for pedido ${pedidoId}`);
      
      const pixPayload = {
        transaction_amount: Number(amount),
        description: description || "Fast IPTV - Assinatura",
        payment_method_id: "pix",
        payer: {
          email: email,
        },
        external_reference: pedidoId,
      };

      const response = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `pix-${pedidoId}-${Date.now()}`,
        },
        body: JSON.stringify(pixPayload),
      });

      const pixResult = await response.json();
      console.log("PIX result:", pixResult.status, "Detail:", pixResult.status_detail);
      console.log("Full PIX response:", JSON.stringify(pixResult));

      if (!response.ok) {
        console.error("PIX error:", pixResult);
        return new Response(JSON.stringify({ 
          error: true,
          message: pixResult.message || "PIX creation failed",
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update pedido with payment id
      const { error: updateError } = await supabase
        .from("pedidos")
        .update({ 
          mercadopago_payment_id: String(pixResult.id),
          status_pagamento: "pendente",
        })
        .eq("id", pedidoId);

      if (updateError) {
        console.error("Error updating pedido:", updateError);
      }

      // Extract PIX data
      const pixData = pixResult.point_of_interaction?.transaction_data;
      
      return new Response(JSON.stringify({ 
        success: true,
        paymentId: pixResult.id,
        status: pixResult.status,
        pixQrCode: pixData?.qr_code,
        pixQrCodeBase64: pixData?.qr_code_base64,
        pixTicketUrl: pixData?.ticket_url,
        expirationDate: pixResult.date_of_expiration,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in mercadopago function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
