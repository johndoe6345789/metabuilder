/**
 * WorkflowCardActions - Edit and favorite action buttons for a workflow card
 */

'use client';

import React from 'react';
import {
  CardActions as CardActionsComp,
  IconButton as IconButtonComp,
  Tooltip as TooltipComp,
} from '@metabuilder/fakemui';
import { Pencil, Star } from '@metabuilder/fakemui';

const CardActions = CardActionsComp as any;
const IconButton = IconButtonComp as any;
const Tooltip = TooltipComp as any;

interface WorkflowCardActionsProps {
  workflowId: string;
  onCardClick: (id: string) => void;
  onFavorite: () => void;
}

export default function WorkflowCardActions({
  workflowId,
  onCardClick,
  onFavorite,
}: WorkflowCardActionsProps) {
  return (
    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
      <Tooltip title="Open in editor">
        <IconButton
          size="small"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onCardClick(workflowId);
          }}
        >
          <Pencil />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add to favorites">
        <IconButton
          size="small"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onFavorite();
          }}
        >
          <Star />
        </IconButton>
      </Tooltip>
    </CardActions>
  );
}
