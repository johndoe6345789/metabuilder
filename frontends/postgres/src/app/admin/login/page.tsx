'use client';

import {
  Box, Container, Paper, Typography,
} from '@metabuilder/components/fakemui';
import LockOutlined from '@metabuilder/components/fakemui/LockOutlined';
import LoginForm from './LoginForm';
import TurboErrorDialog from './TurboErrorDialog';
import { useAdminLogin } from './hooks/useAdminLogin';

export default function AdminLoginPage() {
  const {
    username, setUsername, password, setPassword,
    error, loading, handleSubmit, handleTurboLogin,
    turboError, clearTurboError,
  } = useAdminLogin();

  return (
    <>
      <TurboErrorDialog
        open={!!turboError}
        message={turboError ?? ''}
        onClose={clearTurboError}
      />
      <Box
        sx={{
          minHeight: '100vh', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4, display: 'flex',
              flexDirection: 'column', alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 56, height: 56, borderRadius: '50%',
                bgcolor: '#6750a4', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                mb: 2,
              }}
            >
              <LockOutlined
                sx={{ color: '#ffffff', fontSize: '2rem' }}
              />
            </Box>
            <Typography
              component="h1"
              variant="h4"
              gutterBottom
            >
              Postgres Admin
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Sign in to access the database admin panel
            </Typography>
            <LoginForm
              username={username}
              password={password}
              error={error}
              loading={loading}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              onTurboLogin={handleTurboLogin}
            />
          </Paper>
        </Container>
      </Box>
    </>
  );
}
