import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tv, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export function Header() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToPlanos = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToPlanos: true } });
    } else {
      document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Tv className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">Fast IPTV</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Início
            </Link>
            <a 
              href="#planos" 
              onClick={scrollToPlanos}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Planos
            </a>
            {isAuthenticated ? (
              <>
                <Link 
                  to={isAdmin ? "/admin" : "/dashboard"} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isAdmin ? "Painel Admin" : "Minha Conta"}
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link to="/cadastro">
                  <Button variant="gradient" size="sm">Criar Conta</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Início
              </Link>
              <a 
                href="#planos" 
                onClick={scrollToPlanos}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Planos
              </a>
              {isAuthenticated ? (
                <>
                  <Link 
                    to={isAdmin ? "/admin" : "/dashboard"} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {isAdmin ? "Painel Admin" : "Minha Conta"}
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    Sair
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">Entrar</Button>
                  </Link>
                  <Link to="/cadastro" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gradient" size="sm" className="w-full">Criar Conta</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
