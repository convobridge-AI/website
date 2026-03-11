import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name?: string;
  company?: string;
  company_id?: number;
  role?: string; // 'admin', 'manager', 'user'
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, company_name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          company: session.user.user_metadata?.company_name,
          company_id: session.user.user_metadata?.company_id
        });
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          company: session.user.user_metadata?.company_name,
          company_id: session.user.user_metadata?.company_id
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (data.user) {
      // Fetch user profile from user_profiles table for role and company_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id, role, full_name')
        .eq('id', data.user.id)
        .single();

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || profile?.full_name,
        company: data.user.user_metadata?.company_name,
        company_id: profile?.company_id,
        role: profile?.role || 'user',
        full_name: profile?.full_name
      });
    }
    toast.success('Login successful!');
    navigate('/dashboard');
  };

  const signup = async (email: string, password: string, name: string, company_name?: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name,
          company_name
        }
      }
    });
    if (error) throw error;
    
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name,
        company: data.user.user_metadata?.company_name
      });
    }
    toast.success('Account created successfully!');
    navigate('/dashboard');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.info('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager' || user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
