'use client';

import {
  Box, Container, Typography,
  Button, CircularProgress,
} from '@shared/m3';
import AppNavbar from './AppNavbar';
import DashboardStats from './DashboardStats';
import { useDashboardStats } from '@/hooks';
import labels from '@/constants/ui-labels.json';
import routes from '@/constants/routes.json';

/**
 * @brief Authenticated dashboard content.
 * Hooks run only after AuthGuard confirms auth.
 */
export default function DashboardContent() {
  const stats = useDashboardStats();

  return (
    <>
      <AppNavbar />
      <Container
        maxWidth="lg"
        style={{ padding: '32px 0' }}
      >
        <Typography
          variant="h4"
          style={{ marginBottom: 32 }}
        >
          {labels.dashboard.title}
        </Typography>
        {stats.isLoading ? (
          <Box style={{
            textAlign: 'center',
            padding: '48px 0',
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <DashboardStats
              bucketCount={stats.bucketCount}
              objectCount={stats.objectCount}
              totalSize={stats.totalSize}
            />
            <Box style={{ marginTop: 32 }}>
              <Button
                variant="contained"
                href={routes.buckets}
              >
                {labels.dashboard.viewBuckets}
              </Button>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
