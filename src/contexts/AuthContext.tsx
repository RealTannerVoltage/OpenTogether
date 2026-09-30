import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { minecraftAuth } from '../services/minecraftAuth';
import { User, Session } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStoredAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize minecraft auth
      await minecraftAuth.initialize();

      // Load stored user and session
      const storedUser = await minecraftAuth.getCurrentUser();
      const storedSession = await minecraftAuth.getCurrentSession();

      if (storedUser) {
        setUser(storedUser);
      }
      if (storedSession) {
        setSession(storedSession);
      }
    } catch (err) {
      console.error('Failed to load stored auth:', err);
      setError('Failed to initialize authentication');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const signInWithMicrosoft = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await minecraftAuth.signInWithMicrosoft();
      
      if (result) {
        setUser(result.user);
        setSession(result.session);
      }
    } catch (err) {
      console.error('Microsoft sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Microsoft');
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      await minecraftAuth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    loading,
    error,
    signInWithMicrosoft,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
