'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { Terminal, PlayArrow, Inventory2 } from '@mui/icons-material';
import { Container } from '@/lib/api';

interface ContainerCardProps {
  container: Container;
  onOpenShell: () => void;
}

export default function ContainerCard({ container, onOpenShell }: ContainerCardProps) {
  const statusColors = {
    running: 'success',
    stopped: 'default',
    paused: 'warning',
  } as const;

  const borderColors = {
    running: '#38b2ac',
    stopped: '#718096',
    paused: '#ecc94b',
  };

  return (
    <Card
      sx={{
        borderLeft: 4,
        borderColor: borderColors[container.status as keyof typeof borderColors] || borderColors.stopped,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flex: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: 'rgba(56, 178, 172, 0.1)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Inventory2 sx={{ color: 'secondary.main', fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h3"
                component="h3"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {container.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {container.image}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={container.status}
            color={statusColors[container.status as keyof typeof statusColors] || 'default'}
            size="small"
            icon={container.status === 'running' ? <PlayArrow sx={{ fontSize: 12 }} /> : undefined}
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              textTransform: 'capitalize',
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                mb: 0.5,
              }}
            >
              Container ID
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {container.id}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                mb: 0.5,
              }}
            >
              Uptime
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {container.uptime}
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onOpenShell}
          disabled={container.status !== 'running'}
          startIcon={<Terminal />}
          sx={{
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'secondary.main',
            },
          }}
        >
          Open Shell
        </Button>
      </CardContent>
    </Card>
  );
}
