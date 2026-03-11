import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';
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

  const normalizeUser = (payload: unknown): User | null => {
    if (!payload) return null;

    const root = payload as Record<string, unknown>;
    const nestedData = root.data as Record<string, unknown> | undefined;
    const source =
      (root.user as Record<string, unknown> | undefined) ??
      (nestedData?.user as Record<string, unknown> | undefined) ??
      root;

    if (!source || typeof source !== 'object') return null;

    const rawCompanyId = source.company_id ?? source.companyId;
    const companyId =
      rawCompanyId === undefined || rawCompanyId === null
        ? undefined
        : Number(rawCompanyId);

    return {
      id: String(source.id ?? ''),
      email: String(source.email ?? ''),
      name: (source.name as string | undefined) ?? (source.full_name as string | undefined),
      full_name: (source.full_name as string | undefined) ?? (source.name as string | undefined),
      company: (source.company_name as string | undefined) ?? (source.company as string | undefined),
      company_id: Number.isNaN(companyId) ? undefined : companyId,
      role: (source.role as string | undefined) ?? 'user',
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!apiClient.isAuthenticated()) {
          setLoading(false);
          return;
        }

        const me = await apiClient.getCurrentUser();
        setUser(normalizeUser(me));
      } catch (_error) {
        // Invalid/expired token: clear local auth state.
        apiClient.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    const userData = normalizeUser(response);
    if (!userData) {
      throw new Error('Login succeeded but user payload is missing');
    }

    setUser(userData);
    toast.success('Login successful!');

    if (userData.role === 'admin') {
      navigate('/admin');
      return;
    }

    navigate('/dashboard');
  };

  const signup = async (email: string, password: string, name: string, company_name?: string) => {
    const response = await apiClient.signup(email, password, name, company_name);
    const userData = normalizeUser(response);
    if (userData) {
      setUser(userData);
    }

    toast.success('Account created successfully!');
    navigate('/dashboard');
  };

  const logout = async () => {
    apiClient.logout();
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
