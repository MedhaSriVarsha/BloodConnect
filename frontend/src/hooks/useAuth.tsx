import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, AuthSession, LoginCredentials, RegisterInput } from '../types/auth';
import { authService } from '../services';
import { appConfig } from '../constants/config';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isDemo: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  loginAsDemoUser: () => Promise<AuthSession>;
  loginAsDemoAdmin: () => Promise<AuthSession>;
  register: (input: RegisterInput) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const current = await authService.getCurrentSession();
      setSession(current);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (credentials: LoginCredentials): Promise<AuthSession> => {
    setIsLoading(true);
    try {
      const authResult = await authService.login(credentials);
      setSession(authResult);
      return authResult;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = async (): Promise<AuthSession> => {
    return login({ identifier: 'marcus.vance@example.org' });
  };

  const loginAsDemoAdmin = async (): Promise<AuthSession> => {
    return login({ identifier: 'admin@bloodbridge.org' });
  };

  const register = async (input: RegisterInput): Promise<AuthSession> => {
    setIsLoading(true);
    try {
      const authResult = await authService.register(input);
      setSession(authResult);
      return authResult;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const user = session?.user || null;
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isAdmin,
        isLoading,
        isDemo: appConfig.isDemo,
        login,
        loginAsDemoUser,
        loginAsDemoAdmin,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
