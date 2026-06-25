'use client'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated } from '@/store/selectors'
import { useAuthRedirect } from './hooks/useAuthRedirect'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  useAuthRedirect(isAuthenticated)
  if (!isAuthenticated) return null
  return <>{children}</>
}
