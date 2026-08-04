'use client';

import { Container, Paper, Typography, Button, Alert } from '@metabuilder/components/m3';
import LockOutlined from '@metabuilder/components/m3/LockOutlined';
import { useState } from 'react';
import { beginLogin } from '@metabuilder/dbal-sso/core';
import { dbalSsoConfig } from '@/lib/dbalSsoConfig';
import s from './login.module.scss';

export default function AdminLoginPage() {
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
    <div className={s.page}>
      <Container maxWidth="sm">
        <Paper elevation={3} className={s.card}>
          <div className={s.iconCircle}>
            <LockOutlined className={s.icon} />
          </div>
          <Typography component="h1" variant="h4" gutterBottom>
            Postgres Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" className={s.subtitle}>
            Sign in with your MetaBuilder account (admin role required)
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            type="button"
            fullWidth
            variant="contained"
            disabled={loading}
            onClick={handleSignIn}
          >
            {loading ? 'Redirecting…' : 'Sign In'}
          </Button>
        </Paper>
      </Container>
    </div>
  );
}
