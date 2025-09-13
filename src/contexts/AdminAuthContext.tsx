import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  username: string;
  session_token: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on app start
    const savedAdmin = localStorage.getItem('admin_session');
    if (savedAdmin) {
      const adminData = JSON.parse(savedAdmin);
      // Verify session is still valid
      validateSession(adminData.session_token).then((isValid) => {
        if (isValid) {
          setAdmin(adminData);
        } else {
          localStorage.removeItem('admin_session');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateSession = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('validate_admin_session', {
        session_token: token
      });

      if (error || !data || data.length === 0) {
        return false;
      }

      return data[0].is_valid;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin_user', {
        p_username: username,
        p_password: password
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Authentication failed' };
      }

      if (data && data.length > 0) {
        const adminData = {
          username: data[0].admin_username,
          session_token: data[0].session_token
        };
        
        setAdmin(adminData);
        localStorage.setItem('admin_session', JSON.stringify(adminData));
        return { success: true };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_session');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};