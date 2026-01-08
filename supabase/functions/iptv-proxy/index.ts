import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("IPTV Proxy: Request received");
    
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("IPTV Proxy: No authorization header");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log("IPTV Proxy: Invalid token", claimsError);
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    console.log("IPTV Proxy: User authenticated:", userId);

    // Get the M3U URL from query params
    const url = new URL(req.url);
    const m3uUrl = url.searchParams.get("url");

    if (!m3uUrl) {
      console.log("IPTV Proxy: No M3U URL provided");
      return new Response(JSON.stringify({ error: "URL M3U não fornecida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("IPTV Proxy: Fetching M3U from:", m3uUrl);

    // Verify user has access to this playlist
    const { data: playlist, error: playlistError } = await supabase
      .from("iptv_playlists")
      .select("*")
      .eq("usuario_id", userId)
      .eq("url_m3u", m3uUrl)
      .eq("ativo", true)
      .maybeSingle();

    if (playlistError) {
      console.log("IPTV Proxy: Database error:", playlistError);
      return new Response(JSON.stringify({ error: "Erro ao verificar acesso" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!playlist) {
      console.log("IPTV Proxy: Playlist not found or no access for user:", userId);
      return new Response(JSON.stringify({ error: "Playlist não encontrada ou sem acesso" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("IPTV Proxy: Playlist access verified:", playlist.id);

    // Fetch the M3U content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const fetchHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      };

      let attemptedUrl = m3uUrl;
      let response = await fetch(attemptedUrl, {
        signal: controller.signal,
        headers: fetchHeaders,
      });

      // Some IPTV providers only respond on HTTPS even if the URL is shared as HTTP.
      // If HTTP returns 404, try the HTTPS equivalent.
      if (!response.ok && response.status === 404 && m3uUrl.startsWith("http://")) {
        const httpsUrl = `https://${m3uUrl.slice("http://".length)}`;
        console.log("IPTV Proxy: HTTP returned 404, trying HTTPS:", httpsUrl);
        attemptedUrl = httpsUrl;
        response = await fetch(attemptedUrl, {
          signal: controller.signal,
          headers: fetchHeaders,
        });
      }

      clearTimeout(timeoutId);

      console.log("IPTV Proxy: M3U fetch response status:", response.status);

      if (!response.ok) {
        console.log("IPTV Proxy: M3U fetch failed with status:", response.status);
        return new Response(
          JSON.stringify({
            error: `Falha ao buscar lista M3U (status: ${response.status})`,
            url: attemptedUrl,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const content = await response.text();
      console.log("IPTV Proxy: M3U content length:", content.length);

      if (!content || content.length === 0) {
        return new Response(JSON.stringify({ error: "Lista M3U vazia" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(content, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("IPTV Proxy: Fetch error:", fetchError.name, fetchError.message);
      
      if (fetchError.name === 'AbortError') {
        return new Response(JSON.stringify({ error: "Tempo limite excedido ao buscar lista M3U" }), {
          status: 504,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: `Erro ao buscar lista: ${fetchError.message}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: any) {
    console.error("IPTV Proxy: General error:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
