'use client';

import { AuthGuard } from '@/components/molecules';
import BucketDetailContent
  from '@/components/organisms/BucketDetailContent';

/**
 * @brief Object browser for a single bucket.
 * AuthGuard wraps content so hooks only run
 * after credentials are confirmed.
 */
export default function BucketDetailPage() {
  return (
    <AuthGuard>
      <BucketDetailContent />
    </AuthGuard>
  );
}
