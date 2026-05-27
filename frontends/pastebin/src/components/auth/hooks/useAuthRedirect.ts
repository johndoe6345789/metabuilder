import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthRedirect(isAuthenticated: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);
}
