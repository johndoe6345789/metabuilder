'use client';

import {
  Container, CircularProgress, Box, Alert,
} from '@shared/m3';
import { useRouter } from 'next/navigation';
import AppNavbar from './AppNavbar';
import BucketList from './BucketList';
import { useBuckets } from '@/hooks';

/**
 * @brief Authenticated bucket list content.
 * Hooks run only after AuthGuard confirms auth.
 */
export default function BucketsContent() {
  const router = useRouter();
  const {
    buckets, isLoading, error,
    createBucket, deleteBucket,
  } = useBuckets();

  const handleOpen = (name: string) => {
    router.push(`/buckets/${name}`);
  };

  return (
    <>
      <AppNavbar />
      <Container
        maxWidth="lg"
        style={{ padding: '32px 0' }}
      >
        {error && (
          <Alert
            severity="error"
            style={{ marginBottom: 16 }}
          >
            {error}
          </Alert>
        )}
        {isLoading ? (
          <Box style={{
            textAlign: 'center',
            padding: '48px 0',
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <BucketList
            buckets={buckets}
            onCreateBucket={createBucket}
            onDeleteBucket={deleteBucket}
            onOpenBucket={handleOpen}
          />
        )}
      </Container>
    </>
  );
}
