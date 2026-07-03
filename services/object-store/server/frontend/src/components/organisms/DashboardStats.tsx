'use client';

import {
  Card, CardContent, Typography,
  Grid, Storage, Folder, Cloud,
} from '@shared/m3';
import { formatBytes } from '@/utils';
import labels from '@/constants/ui-labels.json';

/** @brief Props for DashboardStats organism. */
export interface DashboardStatsProps {
  bucketCount: number;
  objectCount: number;
  totalSize: number;
}

/** @brief Single stat card. */
function StatCard({
  icon, label, value, testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent
        style={{ textAlign: 'center' }}
      >
        {icon}
        <Typography
          variant="h4"
          style={{ margin: '8px 0' }}
        >
          {value}
        </Typography>
        <Typography style={{ opacity: 0.7 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

/**
 * @brief Dashboard stat cards.
 * @param props - DashboardStats properties.
 */
export default function DashboardStats({
  bucketCount, objectCount, totalSize,
}: DashboardStatsProps) {
  return (
    <Grid
      container
      spacing={3}
      data-testid="dashboard-stats"
      aria-label="Storage statistics"
    >
      <Grid xs={12} sm={4}>
        <StatCard
          icon={<Folder />}
          label={labels.dashboard.buckets}
          value={String(bucketCount)}
          testId="stat-buckets"
        />
      </Grid>
      <Grid xs={12} sm={4}>
        <StatCard
          icon={<Storage />}
          label={labels.dashboard.objects}
          value={String(objectCount)}
          testId="stat-objects"
        />
      </Grid>
      <Grid xs={12} sm={4}>
        <StatCard
          icon={<Cloud />}
          label={labels.dashboard.storage}
          value={formatBytes(totalSize)}
          testId="stat-storage"
        />
      </Grid>
    </Grid>
  );
}
