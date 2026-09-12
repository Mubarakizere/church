import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiUrls } from '@/config/api';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    // Check if user is already logged in on app start
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { email });
      
      const response = await fetch(apiUrls.login(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      console.log('Login response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      // Try to parse JSON, but handle non-JSON responses gracefully
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
        console.log('Received JSON response:', data);
      } else {
        // backend returned HTML or plain text (often an error page)
        const text = await response.text();
        console.error('Non-JSON login response from server:', text);
        throw new Error('Server returned non-JSON response. See console for details.');
      }

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Also call backend logout to revoke token
    if (token) {
      fetch(apiUrls.logout(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(async resp => {
          if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            console.error('Logout responded with error:', resp.status, text);
          }
        })
        .catch(err => console.error('Logout request failed:', err));
    }
  };

  const checkAuth = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrls.check(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json') && response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (!response.ok) {
        // Token is invalid or server returned non-JSON
        const text = await response.text().catch(() => '');
        console.error('Auth check failed:', response.status, text);
        logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};