'use client';
import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export function useApi() {
  const { token } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, opts = {}) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}${endpoint}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...opts.headers } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Request failed');
      return data;
    } catch (e) { setError(e.message); throw e; } finally { setLoading(false); }
  }, [token]);

  const get = useCallback((e) => request(e), [request]);
  const post = useCallback((e, b) => request(e, { method: 'POST', body: JSON.stringify(b) }), [request]);
  const put = useCallback((e, b) => request(e, { method: 'PUT', body: JSON.stringify(b) }), [request]);
  const del = useCallback((e) => request(e, { method: 'DELETE' }), [request]);

  return { get, post, put, del, loading, error, clearError: () => setError(null) };
}
