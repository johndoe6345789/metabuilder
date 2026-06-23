'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import PasswordField from './PasswordField';

type LoginFormProps = {
  username: string;
  password: string;
  error: string;
  loading: boolean;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTurboLogin: () => void;
};

export default function LoginForm({
  username,
  password,
  error,
  loading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onTurboLogin,
}: LoginFormProps) {
  return (
    <>
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ width: '100%' }}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={e => onUsernameChange(e.target.value)}
          disabled={loading}
        />
        <PasswordField
          value={password}
          onChange={onPasswordChange}
          disabled={loading}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
        <Button
          type="button"
          fullWidth
          variant="outlined"
          sx={{ mb: 2, py: 1.5 }}
          onClick={onTurboLogin}
          disabled={loading}
        >
          ⚡ Turbologin
        </Button>
      </Box>
    </>
  );
}
