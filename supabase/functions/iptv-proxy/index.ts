import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const redactSensitiveUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    const sensitiveKeys = new Set([
      "username",
      "user",
      "login",
      "password",
      "pass",
      "token",
      "api_key",
      "apikey",
      "key",
    ]);

    for (const [k] of u.searchParams.entries()) {
      if (sensitiveKeys.has(k.toLowerCase())) {
        u.searchParams.set(k, "***");
      }
    }

    return u.toString();
  } catch {
    return raw;
  }
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

    // Create backend client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for storage access
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated
    const token = authHeader.replace("Bearer ", "");
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

    // Inputs: playlistId (preferred) or url (fallback)
    const requestUrl = new URL(req.url);
    let m3uUrl = requestUrl.searchParams.get("url");
    let playlistId = requestUrl.searchParams.get("playlistId");

    // Support POST body (supabase.functions.invoke)
    if (!m3uUrl && !playlistId && req.method !== "GET") {
      const body = (await req.json().catch(() => null)) as any;
      if (body && typeof body === "object") {
        m3uUrl = typeof body.url === "string" ? body.url : null;
        playlistId = typeof body.playlistId === "string" ? body.playlistId : null;
      }
    }

    if (!m3uUrl && !playlistId) {
      console.log("IPTV Proxy: No M3U URL or playlistId provided");
      return new Response(JSON.stringify({ error: "URL M3U ou playlistId não fornecido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (m3uUrl) {
      console.log("IPTV Proxy: Requested M3U URL:", redactSensitiveUrl(m3uUrl));
    }
    if (playlistId) {
      console.log("IPTV Proxy: Requested playlistId:", playlistId);
    }

    // Verify user has access to this playlist
    let playlistQuery = supabase
      .from("iptv_playlists")
      .select("*")
      .eq("usuario_id", userId)
      .eq("ativo", true);

    if (playlistId) {
      playlistQuery = playlistQuery.eq("id", playlistId);
    } else {
      playlistQuery = playlistQuery.eq("url_m3u", m3uUrl!);
    }

    const { data: playlist, error: playlistError } = await playlistQuery.maybeSingle();

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

    // Check if playlist uses file or URL
    const tipoFonte = (playlist as any).tipo_fonte || 'url';
    const arquivoM3u = (playlist as any).arquivo_m3u;

    // If playlist uses uploaded file, fetch from storage
    if (tipoFonte === 'arquivo' && arquivoM3u) {
      console.log("IPTV Proxy: Fetching M3U from storage:", arquivoM3u);

      const { data: fileData, error: fileError } = await supabaseAdmin.storage
        .from('m3u-files')
        .download(arquivoM3u);

      if (fileError || !fileData) {
        console.log("IPTV Proxy: Storage fetch error:", fileError);
        return new Response(JSON.stringify({ error: "Erro ao buscar arquivo M3U" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const content = await fileData.text();
      console.log("IPTV Proxy: M3U file content length:", content.length);

      if (!content || content.length === 0) {
        return new Response(JSON.stringify({ error: "Arquivo M3U vazio" }), {
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
    }

    // Otherwise, fetch from external URL
    const effectiveM3uUrl = playlist.url_m3u;
    
    if (!effectiveM3uUrl) {
      console.log("IPTV Proxy: No URL configured for playlist");
      return new Response(JSON.stringify({ error: "Playlist sem URL configurada" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("IPTV Proxy: Fetching M3U from:", redactSensitiveUrl(effectiveM3uUrl));

    // Fetch the M3U content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

    try {
      const fetchHeaders = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      };

      let attemptedUrl = effectiveM3uUrl;
      let response = await fetch(attemptedUrl, {
        signal: controller.signal,
        headers: fetchHeaders,
      });

      // Some IPTV providers only respond on HTTPS even if the URL is shared as HTTP.
      // If HTTP returns 404, try the HTTPS equivalent.
      if (!response.ok && response.status === 404 && attemptedUrl.startsWith("http://")) {
        const httpsUrl = `https://${attemptedUrl.slice("http://".length)}`;
        console.log("IPTV Proxy: HTTP returned 404, trying HTTPS:", redactSensitiveUrl(httpsUrl));
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
            url: redactSensitiveUrl(attemptedUrl),
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
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

      if (fetchError.name === "AbortError") {
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
