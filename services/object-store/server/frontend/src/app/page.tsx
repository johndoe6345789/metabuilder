'use client';

import { AuthGuard } from '@/components/molecules';
import DashboardContent
  from '@/components/organisms/DashboardContent';

/**
 * @brief Dashboard overview page.
 * AuthGuard wraps content so hooks only run
 * after credentials are confirmed.
 */
export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
