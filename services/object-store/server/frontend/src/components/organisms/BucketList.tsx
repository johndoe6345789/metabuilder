'use client';

import { useState } from 'react';
import {
  Button, Typography, Stack, Add,
} from '@shared/m3';
import type { Bucket } from '@/types';
import {
  BucketGrid,
  CreateBucketDialog,
  ConfirmDialog,
} from '../molecules';
import labels from '@/constants/ui-labels.json';

/** @brief Props for BucketList organism. */
export interface BucketListProps {
  buckets: Bucket[];
  onCreateBucket: (name: string) => void;
  onDeleteBucket: (name: string) => void;
  onOpenBucket: (name: string) => void;
}

/**
 * @brief Bucket list with create action.
 * @param props - BucketList properties.
 */
export default function BucketList({
  buckets,
  onCreateBucket,
  onDeleteBucket,
  onOpenBucket,
}: BucketListProps) {
  const [createOpen, setCreateOpen] =
    useState(false);
  const [delTarget, setDelTarget] =
    useState<string | null>(null);

  return (
    <div data-testid="bucket-list">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        style={{ marginBottom: 24 }}
      >
        <Typography variant="h5">
          {labels.buckets.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
          aria-label={labels.buckets.create}
        >
          {labels.buckets.create}
        </Button>
      </Stack>

      <BucketGrid
        buckets={buckets}
        onOpen={onOpenBucket}
        onDelete={setDelTarget}
      />

      <CreateBucketDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={onCreateBucket}
      />

      <ConfirmDialog
        open={!!delTarget}
        title={labels.buckets.delete}
        message={labels.dialogs.deleteBucket
          .replace('{name}', delTarget ?? '')}
        onConfirm={() => {
          if (delTarget) {
            onDeleteBucket(delTarget);
          }
          setDelTarget(null);
        }}
        onCancel={() => setDelTarget(null)}
      />
    </div>
  );
}
