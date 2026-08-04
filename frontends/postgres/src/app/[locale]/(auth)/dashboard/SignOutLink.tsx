'use client';

import { useRouter } from 'next/navigation';
import { BASE_PATH } from '@/lib/app-config';

export function SignOutLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch(`${BASE_PATH}/api/admin/logout`, { method: 'POST' });
    router.push('/sign-in');
    router.refresh();
  };

  return (
    <button type="button" className={className} onClick={() => { void handleSignOut(); }}>
      {children}
    </button>
  );
}
