import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, authEventEmitter } from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar user e token do localStorage ao montar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    try {
      if (storedToken && storedUser && storedUser !== 'undefined') {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // Se os dados estiverem corrompidos, limpa o localStorage para evitar erros futuros.
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

    setLoading(false);

    // Escuta por eventos de logout forçado vindos do interceptor da API
    const handleForceLogout = () => {
      logout();
    };
    authEventEmitter.on('auth:logout', handleForceLogout);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { accessToken, user: userData } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await authAPI.signup({ name, email, password });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const logout = async () => {
    // Limpa o estado do cliente imediatamente para uma experiência de usuário mais rápida
    localStorage.removeItem('token'); // Já estava correto, mas confirmando.
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);

    // Tenta invalidar o refresh token no backend
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Failed to logout from server, but client is logged out.", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
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
