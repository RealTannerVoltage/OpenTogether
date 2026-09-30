import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import * as SecureStore from 'expo-secure-store';
import { User, Session } from '../types';
import { MICROSOFT_AUTH_CONFIG } from '../config/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEYS = {
  USER: 'opentogether_user',
  SESSION: 'opentogether_session',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  msalInstance: PublicClientApplication;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, msalInstance }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveUser = useCallback(async (userData: User) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const saveSession = useCallback(async (sessionData: Session) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    setSession(sessionData);
  }, []);

  const clearAuth = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION);
    setUser(null);
    setSession(null);
    await msalInstance.logoutRedirect();
  }, [msalInstance]);

  const loadStoredAuth = useCallback(async () => {
    try {
      const storedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      const storedSession = await SecureStore.getItemAsync(STORAGE_KEYS.SESSION);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedSession) {
        const sessionData: Session = JSON.parse(storedSession);
        if (new Date(sessionData.expiresAt) > new Date()) {
          setSession(sessionData);
        } else {
          await clearAuth();
        }
      }
    } catch (err) {
      console.error('Failed to load stored auth:', err);
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  // Initialize MSAL
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        
        // Check for active accounts
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          const userData: User = {
            id: account.localAccountId || account.homeAccountId || crypto.randomUUID(),
            username: account.name || account.username || 'User',
            email: account.username || '',
            microsoftId: account.localAccountId || account.homeAccountId || '',
          };

          const sessionData: Session = {
            user: userData,
            token: '',
            expiresAt: new Date(Date.now() + 3600000),
          };

          await saveUser(userData);
          await saveSession(sessionData);
        }
      } catch (err) {
        console.error('MSAL initialization error:', err);
      }
    };

    initializeMsal();
  }, [msalInstance, saveUser, saveSession]);

  const signInWithMicrosoft = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const loginRequest = {
        scopes: MICROSOFT_AUTH_CONFIG.scopes,
        redirectUri: MICROSOFT_AUTH_CONFIG.redirectUri,
      };

      const authResult = await msalInstance.loginRedirect(loginRequest);
      
      if (authResult.account) {
        const account: AccountInfo = authResult.account;
        
        const userData: User = {
          id: account.localAccountId || account.homeAccountId || crypto.randomUUID(),
          username: account.name || account.username || 'User',
          email: account.username || '',
          microsoftId: account.localAccountId || account.homeAccountId || '',
        };

        const sessionData: Session = {
          user: userData,
          token: authResult.idToken || '',
          expiresAt: new Date(Date.now() + 3600000),
        };

        await saveUser(userData);
        await saveSession(sessionData);
      }
    } catch (err) {
      console.error('Microsoft sign in error:', err);
      setError('Failed to sign in with Microsoft');
    } finally {
      setLoading(false);
    }
  }, [saveUser, saveSession]);

  const signOut = useCallback(async () => {
    await clearAuth();
  }, [clearAuth]);

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
