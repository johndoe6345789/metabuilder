/**
 * WorkflowCardItem - Single workflow card in the project canvas
 */

'use client';

import React from 'react';
import {
  Card as CardComp,
  CardContent as CardContentComp,
  Stack as StackComp,
  Typography as TypographyComp,
  Chip as ChipComp,
  Grid as GridComp,
} from '@metabuilder/m3';
import WorkflowCardActions from './WorkflowCardActions';
import WorkflowCardMeta from './WorkflowCardMeta';
import type {
  WorkflowCardItemProps,
} from './workflowCardItemTypes';

const Card = CardComp as any;
const CardContent = CardContentComp as any;
const Stack = StackComp as any;
const Typography = TypographyComp as any;
const Chip = ChipComp as any;
const Grid = GridComp as any;

export default function WorkflowCardItem({
  workflow,
  onCardClick,
  onDragStart,
  onFavorite,
  getStatusColor,
  getStatusBorderColor,
  formatDate,
}: WorkflowCardItemProps) {
  return (
    <Grid item xs={12} sm={6} md={4} key={workflow.id}>
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          borderLeft: `4px solid ${
            getStatusBorderColor(workflow.status)
          }`,
        }}
        onClick={() => onCardClick(workflow.id)}
        draggable
        onDragStart={(e) => onDragStart(e, workflow.id)}
      >
        <CardContent sx={{ pb: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            justifyContent="space-between"
            mb={1}
          >
            <Typography variant="h6" sx={{ flex: 1 }}>
              {workflow.name}
            </Typography>
            <Chip
              label={workflow.status}
              size="small"
              color={getStatusColor(workflow.status)}
              variant="filled"
            />
          </Stack>
          {workflow.description && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mb: 2, lineHeight: 1.5 }}
            >
              {workflow.description}
            </Typography>
          )}
        </CardContent>
        <WorkflowCardMeta
          nodeCount={workflow.nodeCount}
          lastModified={workflow.lastModified}
          formatDate={formatDate}
        />
        <WorkflowCardActions
          workflowId={workflow.id}
          onCardClick={onCardClick}
          onFavorite={onFavorite}
        />
      </Card>
    </Grid>
  );
}
