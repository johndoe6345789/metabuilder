'use client';

import {
  Grid, Typography,
} from '@shared/m3';
import type { Bucket } from '@/types';
import BucketCard from './BucketCard';
import labels from '@/constants/ui-labels.json';

/** @brief Props for BucketGrid molecule. */
export interface BucketGridProps {
  buckets: Bucket[];
  onOpen: (name: string) => void;
  onDelete: (name: string) => void;
}

/**
 * @brief Grid of bucket cards or empty state.
 * @param props - BucketGrid properties.
 */
export default function BucketGrid({
  buckets,
  onOpen,
  onDelete,
}: BucketGridProps) {
  if (buckets.length === 0) {
    return (
      <Typography style={{ opacity: 0.7 }}>
        {labels.buckets.empty}
      </Typography>
    );
  }

  return (
    <Grid
      container
      spacing={2}
      data-testid="bucket-grid"
    >
      {buckets.map((b) => (
        <Grid
          key={b.name}
          xs={12} sm={6} md={4}
        >
          <BucketCard
            bucket={b}
            onOpen={onOpen}
            onDelete={onDelete}
          />
        </Grid>
      ))}
    </Grid>
  );
}
