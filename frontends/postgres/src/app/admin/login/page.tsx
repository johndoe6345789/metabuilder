'use client';

import { Container, Paper, Typography } from '@metabuilder/components/fakemui';
import LockOutlined from '@metabuilder/components/fakemui/LockOutlined';
import s from './login.module.scss';
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
      <div className={s.page}>
        <Container maxWidth="sm">
          <Paper elevation={3} className={s.card}>
            <div className={s.iconCircle}>
              <LockOutlined className={s.icon} />
            </div>
            <Typography component="h1" variant="h4" gutterBottom>
              Postgres Admin
            </Typography>
            <Typography variant="body2" color="text.secondary"
              className={s.subtitle}>
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
      </div>
    </>
  );
}
