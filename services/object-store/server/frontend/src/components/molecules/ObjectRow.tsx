'use client';

import {
  TableRow, TableCell, IconButton,
  Stack, Download, Delete,
} from '@shared/m3';
import { FileIcon, SizeLabel } from '../atoms';
import type { S3Object } from '@/types';
import labels from '@/constants/ui-labels.json';

/** @brief Props for ObjectRow molecule. */
export interface ObjectRowProps {
  object: S3Object;
  onDownload: (key: string) => void;
  onDelete: (key: string) => void;
  testId?: string;
}

/**
 * @brief Table row for a single S3 object.
 * @param props - ObjectRow properties.
 */
export default function ObjectRow({
  object,
  onDownload,
  onDelete,
  testId = 'object-row',
}: ObjectRowProps) {
  return (
    <TableRow data-testid={testId}>
      <TableCell>
        <Stack direction="row" spacing={1}
          alignItems="center">
          <FileIcon filename={object.key} />
          <span>{object.key}</span>
        </Stack>
      </TableCell>
      <TableCell>
        <SizeLabel bytes={object.size} />
      </TableCell>
      <TableCell>
        {new Date(
          object.lastModified,
        ).toLocaleString()}
      </TableCell>
      <TableCell align="right">
        <IconButton
          size="small"
          onClick={() =>
            onDownload(object.key)}
          aria-label={
            `${labels.objects.download}`
            + ` ${object.key}`
          }
        >
          <Download />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() =>
            onDelete(object.key)}
          aria-label={
            `${labels.objects.delete}`
            + ` ${object.key}`
          }
        >
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
