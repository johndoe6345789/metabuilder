'use client';

import { useState } from 'react';
import type { S3Object } from '@/types';
import {
  ObjectToolbar,
  ObjectDataTable,
  UploadDialog,
  ConfirmDialog,
} from '../molecules';
import labels from '@/constants/ui-labels.json';

/** @brief Props for ObjectTable organism. */
export interface ObjectTableProps {
  objects: S3Object[];
  bucketName: string;
  prefix: string;
  onPrefixChange: (p: string) => void;
  onUpload: (key: string, file: File) => void;
  onDownload: (key: string) => void;
  onDelete: (key: string) => void;
  onRefresh: () => void;
}

/**
 * @brief Object listing table with toolbar.
 * @param props - ObjectTable properties.
 */
export default function ObjectTable({
  objects,
  bucketName,
  prefix,
  onPrefixChange,
  onUpload,
  onDownload,
  onDelete,
  onRefresh,
}: ObjectTableProps) {
  const [uploadOpen, setUploadOpen] =
    useState(false);
  const [delTarget, setDelTarget] =
    useState<string | null>(null);

  return (
    <div data-testid="object-table">
      <ObjectToolbar
        prefix={prefix}
        onPrefixChange={onPrefixChange}
        onUploadClick={() => setUploadOpen(true)}
        onRefresh={onRefresh}
      />

      <ObjectDataTable
        objects={objects}
        onDownload={onDownload}
        onDelete={setDelTarget}
      />

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={onUpload}
        prefix={prefix}
      />

      <ConfirmDialog
        open={!!delTarget}
        title={labels.objects.delete}
        message={labels.dialogs.deleteObject
          .replace('{key}', delTarget ?? '')}
        onConfirm={() => {
          if (delTarget) onDelete(delTarget);
          setDelTarget(null);
        }}
        onCancel={() => setDelTarget(null)}
      />
    </div>
  );
}
