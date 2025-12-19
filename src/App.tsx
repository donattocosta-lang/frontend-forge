import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WhatsAppButton } from "./components/WhatsAppButton";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SaibaMais from "./pages/SaibaMais";
import GuiasInstalacao from "./pages/GuiasInstalacao";
import FAQ from "./pages/FAQ";
import TermosUso from "./pages/TermosUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PagamentoFalha from "./pages/PagamentoFalha";
import PagamentoPendente from "./pages/PagamentoPendente";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/saiba-mais" element={<SaibaMais />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/guias-instalacao" element={<GuiasInstalacao />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/termos-de-uso" element={<TermosUso />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />
            <Route path="/pagamento/falha" element={<PagamentoFalha />} />
            <Route path="/pagamento/pendente" element={<PagamentoPendente />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
