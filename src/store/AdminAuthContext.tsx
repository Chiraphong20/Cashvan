import React, { createContext, useContext, useState, useEffect } from 'react';

interface Admin {
  id: number;
  username: string;
  name: string;
}

interface AdminAuthContextType {
  currentAdmin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (admin: Admin, token: string) => void;
  logout: () => void;
  updateProfile: (admin: Admin) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_user');
    const storedToken = localStorage.getItem('admin_token');
    
    if (storedAdmin && storedToken) {
      setCurrentAdmin(JSON.parse(storedAdmin));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (admin: Admin, newToken: string) => {
    setCurrentAdmin(admin);
    setToken(newToken);
    localStorage.setItem('admin_user', JSON.stringify(admin));
    localStorage.setItem('admin_token', newToken);
  };

  const logout = () => {
    setCurrentAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  };

  const updateProfile = (admin: Admin) => {
    setCurrentAdmin(admin);
    localStorage.setItem('admin_user', JSON.stringify(admin));
  };

  return (
    <AdminAuthContext.Provider value={{ currentAdmin, token, loading, login, logout, updateProfile }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
