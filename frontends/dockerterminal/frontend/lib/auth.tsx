'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  refreshTokens,
  logout as oidcLogout,
  setAuthToken,
  getAuthToken,
  isTokenValid,
  decodeJwtPayload,
} from '@metabuilder/dbal-sso/core';
import { dbalSsoConfig } from './dbalSsoConfig';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'dockerterminal-web-sso';

interface PersistedSession {
  token: string;
  refreshToken: string | null;
}

export function loadPersistedSession(): PersistedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as PersistedSession : null;
  } catch {
    return null;
  }
}

export function savePersistedSession(session: PersistedSession | null): void {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore quota errors
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((token: string) => {
    const claims = decodeJwtPayload(token);
    setAuthToken(token);
    setIsAuthenticated(true);
    setUsername(typeof claims.sub === 'string' ? claims.sub : null);
  }, []);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    savePersistedSession(null);
    setIsAuthenticated(false);
    setUsername(null);
    setRefreshToken(null);
  }, []);

  useEffect(() => {
    const persisted = loadPersistedSession();
    if (!persisted) {
      setLoading(false);
      return;
    }
    if (isTokenValid(persisted.token)) {
      applyToken(persisted.token);
      setRefreshToken(persisted.refreshToken);
      setLoading(false);
      return;
    }
    if (persisted.refreshToken) {
      refreshTokens(dbalSsoConfig, persisted.refreshToken)
        .then(tokens => {
          savePersistedSession({ token: tokens.token, refreshToken: tokens.refreshToken });
          applyToken(tokens.token);
          setRefreshToken(tokens.refreshToken);
        })
        .catch(() => clearSession())
        .finally(() => setLoading(false));
      return;
    }
    clearSession();
    setLoading(false);
  }, [applyToken, clearSession]);

  const logout = async () => {
    try {
      await oidcLogout(dbalSsoConfig, refreshToken);
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { getAuthToken };
