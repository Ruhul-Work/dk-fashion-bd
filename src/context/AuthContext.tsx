import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, api } from '../services/api';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('essence_token');
      if (token) {
        // try {
          const profile = await api.getUserProfile();
          setUser(profile);
        // } catch (e) {
        //   localStorage.removeItem('essence_token');
        // }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (phone: string, password: string) => {
    const result = await api.login({ phone, password });
    if (result.user) {
      setUser(result.user);
    } else {
      // Fallback: fetch profile if login didn't return user
      const profile = await api.getUserProfile();
      setUser(profile);
    }
    toast.success('Successfully logged in!');
  };

  const register = async (data: any) => {
    await api.register(data);
    toast.success('Registration successful! Please login.');
    // After registration, user probably needs to login
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout failed on server, clearing local state', e);
    } finally {
      setUser(null);
      localStorage.removeItem('essence_token');
      toast.success('Logged out successfully');
    }
  };

  const updateUser = async (data: any) => {
    if (!user) return;
    const updated = await api.updateProfile(data);
    setUser(prev => prev ? { ...prev, ...updated } : null);
    toast.success('Profile updated successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: login as any, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
