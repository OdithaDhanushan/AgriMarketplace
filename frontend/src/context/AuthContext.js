import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'freshvegi_auth';

const readStoredAuth = async () => {
  try {
    const raw = Platform.OS === 'web'
      ? (typeof window !== 'undefined' ? window.sessionStorage?.getItem(STORAGE_KEY) : null)
      : await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return { user: null, token: null };

    const parsed = JSON.parse(raw);
    return {
      user: parsed.user || null,
      token: parsed.token || null,
    };
  } catch (error) {
    console.warn('Auth storage read failed:', error.message);
    return { user: null, token: null };
  }
};

const persistAuth = async (auth) => {
  const serializedAuth = auth.user && auth.token ? JSON.stringify(auth) : null;

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    if (serializedAuth) {
      window.sessionStorage.setItem(STORAGE_KEY, serializedAuth);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    return;
  }

  if (serializedAuth) {
    await SecureStore.setItemAsync(STORAGE_KEY, serializedAuth);
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ user: null, token: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    readStoredAuth().then((storedAuth) => {
      if (!isMounted) return;
      setAuth(storedAuth);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setAuthToken(auth.token);
    if (isLoading) return;

    persistAuth(auth).catch((error) => {
      console.warn('Auth storage write failed:', error.message);
    });
  }, [auth, isLoading]);

  const login = ({ user, token }) => {
    setAuth({ user, token });
  };

  const logout = () => {
    setAuth({ user: null, token: null });
  };

  const updateUser = (updates) => {
    setAuth((current) => {
      if (!current.user) return current;
      return {
        ...current,
        user: {
          ...current.user,
          ...updates,
          email: updates.email ? updates.email.trim().toLowerCase() : current.user.email,
        },
      };
    });
  };

  const value = useMemo(() => ({
    user: auth.user,
    token: auth.token,
    isLoading,
    isAuthenticated: Boolean(auth.user && auth.token),
    login,
    logout,
    updateUser,
  }), [auth, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
