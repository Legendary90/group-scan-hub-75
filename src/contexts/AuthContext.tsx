import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, authenticateClient, registerClient, checkSubscriptionStatus } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    username: string;
    password: string;
    company_name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
  }) => Promise<{ success: boolean; client_id?: string; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Verify subscription status
      checkSubscriptionStatus(userData.client_id).then(({ active }) => {
        if (active) {
          setUser(userData);
        } else {
          localStorage.removeItem('auth_user');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { user, error } = await authenticateClient(username, password);
    
    if (user) {
      setUser(user);
      localStorage.setItem('auth_user', JSON.stringify(user));
      return { success: true };
    }
    
    return { success: false, error };
  };

  const register = async (userData: {
    username: string;
    password: string;
    company_name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
  }): Promise<{ success: boolean; client_id?: string; error?: string }> => {
    const { client_id, error } = await registerClient(userData);
    
    if (client_id) {
      return { success: true, client_id };
    }
    
    return { success: false, error };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};