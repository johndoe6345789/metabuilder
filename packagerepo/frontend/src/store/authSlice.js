import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const API = process.env.NEXT_PUBLIC_API_URL || '';

export const login = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  const data = await res.json();
  if (!res.ok) return rejectWithValue(data.error?.message || 'Login failed');
  localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user));
  return data;
});

export const logout = createAsyncThunk('auth/logout', async () => { localStorage.removeItem('token'); localStorage.removeItem('user'); });

export const checkAuth = createAsyncThunk('auth/check', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token'), user = localStorage.getItem('user');
  return token && user ? { token, user: JSON.parse(user) } : rejectWithValue('Not authenticated');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: true, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(login.fulfilled, (s, { payload }) => { s.loading = false; s.token = payload.token; s.user = payload.user; })
     .addCase(login.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
     .addCase(logout.fulfilled, (s) => { s.user = null; s.token = null; })
     .addCase(checkAuth.pending, (s) => { s.loading = true; })
     .addCase(checkAuth.fulfilled, (s, { payload }) => { s.loading = false; s.token = payload.token; s.user = payload.user; })
     .addCase(checkAuth.rejected, (s) => { s.loading = false; s.user = null; s.token = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
