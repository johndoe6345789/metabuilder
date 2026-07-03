'use client';

import { AuthGuard } from '@/components/molecules';
import BucketsContent
  from '@/components/organisms/BucketsContent';

/**
 * @brief Bucket list page.
 * AuthGuard wraps content so hooks only run
 * after credentials are confirmed.
 */
export default function BucketsPage() {
  return (
    <AuthGuard>
      <BucketsContent />
    </AuthGuard>
  );
}
