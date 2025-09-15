import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  adminUsername: string | null;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on app start
    const savedSession = localStorage.getItem('admin_session');
    if (savedSession) {
      validateAdminSession(savedSession);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateAdminSession = async (sessionToken: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_admin_session', {
        session_token: sessionToken
      });

      if (error) throw error;

      if (data && data.length > 0 && data[0].is_valid) {
        setIsAdminAuthenticated(true);
        setAdminUsername(data[0].admin_username);
      } else {
        localStorage.removeItem('admin_session');
        setIsAdminAuthenticated(false);
        setAdminUsername(null);
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('admin_session');
      setIsAdminAuthenticated(false);
      setAdminUsername(null);
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin_user', {
        p_username: username,
        p_password: password
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const { admin_username, session_token } = data[0];
        localStorage.setItem('admin_session', session_token);
        setIsAdminAuthenticated(true);
        setAdminUsername(admin_username);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_session');
    setIsAdminAuthenticated(false);
    setAdminUsername(null);
  };

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdminAuthenticated, 
        adminLogin, 
        adminLogout, 
        adminUsername, 
        isLoading 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};