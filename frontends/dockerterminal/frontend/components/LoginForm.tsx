'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  LockOpen,
} from '@metabuilder/components/fakemui';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import TurboErrorDialog from './TurboErrorDialog';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [turboError, setTurboError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleTurboLogin = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      if (!raw.trim()) {
        setTurboError('Clipboard is empty. Copy a Turbologin from Vault first.');
        return;
      }
      let data: Record<string, unknown>;
      try { data = JSON.parse(raw); } catch {
        setTurboError('Clipboard does not contain valid Turbologin JSON.');
        return;
      }
      if (!data.user || !data.pass) {
        setTurboError('Clipboard JSON is missing required fields (user, pass).');
        return;
      }
      setUsername(data.user as string);
      setPassword(data.pass as string);
      setError('');
      const success = await login(data.user as string, data.pass as string);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setTurboError(
        'Could not read clipboard. Please allow clipboard access and try again.'
      );
    }
  };

  return (
    <>
      <TurboErrorDialog
        open={!!turboError}
        message={turboError ?? ''}
        onClose={() => setTurboError(null)}
      />
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
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            animation: isShaking ? 'shake 0.5s' : 'none',
            '@keyframes shake': {
              '0%, 100%': { transform: 'translateX(0)' },
              '25%': { transform: 'translateX(-10px)' },
              '75%': { transform: 'translateX(10px)' },
            },
          }}
        >
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
                Enter your credentials to access container management
              </Typography>
            </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth label="Username" value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal" required autoComplete="username" sx={{ mb: 2 }}
              />
              <TextField
                fullWidth label="Password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal" required autoComplete="current-password" sx={{ mb: 3 }}
              />
              <Button
                type="submit" fullWidth variant="contained"
                color="secondary" size="large" sx={{ mb: 2 }}
              >
                Access Dashboard
              </Button>
              <Button
                type="button" fullWidth variant="outlined"
                color="secondary" size="large" sx={{ mb: 2 }}
                onClick={handleTurboLogin}
                data-testid="turbo-login-button"
              >
                ⚡ Turbologin
              </Button>
              <Typography
                variant="caption" color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}
              >
                Default: admin / admin123
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
