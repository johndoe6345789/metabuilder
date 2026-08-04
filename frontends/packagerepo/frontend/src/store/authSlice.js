import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  beginLogin,
  completeLogin,
  refreshTokens,
  logout as oidcLogout,
  setAuthToken,
  decodeJwtPayload,
  isTokenValid,
} from '@metabuilder/dbal-sso/core';
import { dbalSsoConfig } from './dbalSsoConfig';

const STORAGE_KEY = 'packagerepo-web-sso';

function loadPersistedSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePersistedSession(session) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore quota errors
  }
}

// DBAL only carries a role claim, not this app's read/write/admin scopes --
// mirrors the backend's own AuthFilter::scopesForRole mapping so
// user.scopes.includes('admin') keeps working for existing UI checks.
function scopesForRole(role) {
  const scopes = ['read', 'write'];
  if (role === 'admin' || role === 'god' || role === 'supergod') scopes.push('admin');
  return scopes;
}

function userFromToken(token) {
  const claims = decodeJwtPayload(token);
  return { username: claims.sub, scopes: scopesForRole(claims.role) };
}

export const startOidcLogin = createAsyncThunk('auth/startOidcLogin', async () => {
  await beginLogin(dbalSsoConfig);
});

export const completeOidcLogin = createAsyncThunk(
  'auth/completeOidcLogin',
  async ({ code, state }, { rejectWithValue }) => {
    try {
      const tokens = await completeLogin(dbalSsoConfig, code, state);
      savePersistedSession({ token: tokens.token, refreshToken: tokens.refreshToken });
      return tokens;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Sign-in failed');
    }
  },
);

export const hydrate = createAsyncThunk('auth/hydrate', async (_, { rejectWithValue }) => {
  const persisted = loadPersistedSession();
  if (!persisted) return rejectWithValue('Not authenticated');

  if (isTokenValid(persisted.token)) {
    return { token: persisted.token, refreshToken: persisted.refreshToken };
  }
  if (persisted.refreshToken) {
    try {
      const tokens = await refreshTokens(dbalSsoConfig, persisted.refreshToken);
      savePersistedSession({ token: tokens.token, refreshToken: tokens.refreshToken });
      return { token: tokens.token, refreshToken: tokens.refreshToken };
    } catch {
      savePersistedSession(null);
      return rejectWithValue('Session expired');
    }
  }
  savePersistedSession(null);
  return rejectWithValue('Not authenticated');
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const { refreshToken } = getState().auth;
  await oidcLogout(dbalSsoConfig, refreshToken);
  savePersistedSession(null);
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, refreshToken: null, loading: true, error: null },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(startOidcLogin.rejected, (s, { error }) => { s.error = error.message; })
     .addCase(completeOidcLogin.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(completeOidcLogin.fulfilled, (s, { payload }) => {
       s.loading = false;
       s.token = payload.token;
       s.refreshToken = payload.refreshToken;
       s.user = userFromToken(payload.token);
       setAuthToken(payload.token);
     })
     .addCase(completeOidcLogin.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
     .addCase(hydrate.pending, (s) => { s.loading = true; })
     .addCase(hydrate.fulfilled, (s, { payload }) => {
       s.loading = false;
       s.token = payload.token;
       s.refreshToken = payload.refreshToken;
       s.user = userFromToken(payload.token);
       setAuthToken(payload.token);
     })
     .addCase(hydrate.rejected, (s) => {
       s.loading = false;
       s.user = null;
       s.token = null;
       s.refreshToken = null;
       setAuthToken(null);
     })
     .addCase(logout.fulfilled, (s) => {
       s.user = null;
       s.token = null;
       s.refreshToken = null;
       setAuthToken(null);
     });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
