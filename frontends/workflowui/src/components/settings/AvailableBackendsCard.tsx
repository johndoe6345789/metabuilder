/**
 * AvailableBackendsCard - Shows all registered DB adapters
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
} from '@metabuilder/fakemui';

interface Adapter {
  name: string;
  active: boolean;
}

interface AvailableBackendsCardProps {
  adapters: Adapter[];
}

export default function AvailableBackendsCard({
  adapters,
}: AvailableBackendsCardProps) {
  if (adapters.length === 0) return null;
  return (
    <Card data-testid="backends-card">
      <CardHeader title="Available Backends" />
      <CardContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {adapters.map((a) => (
            <Chip
              key={a.name}
              label={a.name}
              color={a.active ? 'primary' : 'default'}
              variant={a.active ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
