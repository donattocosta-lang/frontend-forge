import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService, usuarioService, Usuario } from '@/services/supabase';
import type { User as AuthUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Usuario | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: { email: string; senha: string; nome_completo: string; telefone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { nome_completo?: string; telefone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile loading with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const [ensuredProfile, adminStatus] = await Promise.all([
        usuarioService.ensureProfile(authUser),
        usuarioService.checkIsAdmin(authUser.id)
      ]);

      setProfile(ensuredProfile);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, senha: string) => {
    const { user, session } = await authService.signIn(email, senha);
    setUser(user);
    setSession(session);
    
    if (user) {
      await loadUserProfile(user);
    }
  };

  const register = async (data: { email: string; senha: string; nome_completo: string; telefone?: string }) => {
    await authService.signUp(data.email, data.senha, {
      nome_completo: data.nome_completo,
      telefone: data.telefone
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const updateProfile = async (updates: { nome_completo?: string; telefone?: string }) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    const updatedProfile = await usuarioService.updateProfile(user.id, updates);
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
