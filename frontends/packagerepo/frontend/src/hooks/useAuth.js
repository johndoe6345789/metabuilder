'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { startOidcLogin, logout, hydrate, clearError } from '../store/authSlice';

export function useAuth({ requireAuth = false, requireAdmin = false } = {}) {
  const dispatch = useDispatch(), router = useRouter();
  const { user, token, loading, error } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(hydrate()); }, [dispatch]);
  useEffect(() => {
    if (loading) return;
    if (requireAuth && !user) router.push('/login');
    if (requireAdmin && !user?.scopes?.includes('admin')) router.push('/');
  }, [loading, user, requireAuth, requireAdmin, router]);

  return {
    user, token, loading, error, isAdmin: user?.scopes?.includes('admin'),
    signIn: () => dispatch(startOidcLogin()),
    logout: () => dispatch(logout()).then(() => router.push('/login')),
    clearError: () => dispatch(clearError()),
  };
}
