'use client';

import {
  Table, TableBody, TableCell,
  TableContainer, TableHead,
  TableRow, Paper, Typography,
} from '@shared/m3';
import type { S3Object } from '@/types';
import ObjectRow from './ObjectRow';
import labels from '@/constants/ui-labels.json';

/** @brief Props for ObjectDataTable molecule. */
export interface ObjectDataTableProps {
  objects: S3Object[];
  onDownload: (key: string) => void;
  onDelete: (key: string) => void;
}

/**
 * @brief Table displaying S3 objects.
 * @param props - ObjectDataTable properties.
 */
export default function ObjectDataTable({
  objects, onDownload, onDelete,
}: ObjectDataTableProps) {
  if (objects.length === 0) {
    return (
      <Typography style={{ opacity: 0.7 }}>
        {labels.objects.empty}
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              {labels.objects.key}
            </TableCell>
            <TableCell>
              {labels.objects.size}
            </TableCell>
            <TableCell>
              {labels.objects.lastModified}
            </TableCell>
            <TableCell align="right">
              {labels.objects.actions}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {objects.map((o) => (
            <ObjectRow
              key={o.key}
              object={o}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
