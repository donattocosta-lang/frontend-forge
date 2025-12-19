import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, Loader2, Check } from 'lucide-react';

const Cadastro = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (formData.senha.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        senha: formData.senha,
        nome_completo: formData.nome_completo,
        telefone: formData.telefone || undefined,
      });
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login.",
      });
      
      navigate('/login');
    } catch (error: any) {
      let message = "Erro ao criar conta";
      
      if (error.message?.includes('User already registered')) {
        message = "Este email já está cadastrado";
      } else if (error.message?.includes('Password should be')) {
        message = "A senha deve ter pelo menos 6 caracteres";
      }
      
      toast({
        title: "Erro no cadastro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { met: formData.senha.length >= 6, text: 'Mínimo 6 caracteres' },
    { met: /[A-Z]/.test(formData.senha), text: 'Uma letra maiúscula' },
    { met: /[0-9]/.test(formData.senha), text: 'Um número' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="w-full max-w-md px-4">
          <div className="gradient-border p-8 rounded-2xl">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold mb-2">Criar Conta</h1>
              <p className="text-muted-foreground">Cadastre-se para começar a assistir</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone (opcional)</Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.senha && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <Check className={`w-3 h-3 ${req.met ? 'text-success' : 'text-muted-foreground'}`} />
                        <span className={req.met ? 'text-success' : 'text-muted-foreground'}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 rounded border-border" required />
                <span className="text-sm text-muted-foreground">
                  Li e aceito os{' '}
                  <Link to="/termos-de-uso" className="text-primary hover:underline">Termos de Uso</Link>
                  {' '}e{' '}
                  <Link to="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                </span>
              </div>

              <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Faça login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cadastro;
