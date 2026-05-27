/**
 * WorkflowCardMeta - Node count and modification date row
 */

'use client';

import React from 'react';
import {
  CardContent as CardContentComp,
  Stack as StackComp,
  Typography as TypographyComp,
} from '@metabuilder/fakemui';

const CardContent = CardContentComp as any;
const Stack = StackComp as any;
const Typography = TypographyComp as any;

interface WorkflowCardMetaProps {
  nodeCount: number;
  lastModified: number;
  formatDate: (ts: number) => string;
}

export default function WorkflowCardMeta({
  nodeCount,
  lastModified,
  formatDate,
}: WorkflowCardMetaProps) {
  return (
    <CardContent sx={{ pt: 0, pb: 1 }}>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
      >
        <Typography variant="caption" color="textSecondary">
          {nodeCount} nodes
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Modified {formatDate(lastModified)}
        </Typography>
      </Stack>
    </CardContent>
  );
}
