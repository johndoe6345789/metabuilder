'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  Alert,
  LockOpen,
} from '@metabuilder/components/m3';
import { beginLogin } from '@metabuilder/dbal-sso/core';
import { dbalSsoConfig } from '@/lib/dbalSsoConfig';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setError('');
    setLoading(true);
    beginLogin(dbalSsoConfig).catch(e => {
      setError(e instanceof Error ? e.message : 'Sign-in failed to start');
      setLoading(false);
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        padding: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64, height: 64, margin: '0 auto 16px',
                background: 'rgba(56, 178, 172, 0.1)',
                borderRadius: '8px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <LockOpen style={{ fontSize: 32, color: 'var(--primary)' }} />
            </Box>
            <Typography variant="h1" component="h1" gutterBottom>
              Container Shell
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in with your MetaBuilder account to access container management
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" style={{ marginBottom: 16 }}>
              {error}
            </Alert>
          )}
          <Button
            type="button" fullWidth variant="contained"
            color="secondary" size="large" disabled={loading}
            onClick={handleSignIn}
          >
            {loading ? 'Redirecting…' : 'Sign In'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
