'use client';

import {
  Alert, Button, CircularProgress, TextField,
} from '@metabuilder/components/fakemui';
import s from './login-form.module.scss';
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
  username, password, error, loading,
  onUsernameChange, onPasswordChange, onSubmit, onTurboLogin,
}: LoginFormProps) {
  return (
    <>
      {error && (
        <Alert severity="error" className={s.error}>{error}</Alert>
      )}
      <form onSubmit={onSubmit} className={s.form}>
        <TextField
          margin="normal" required fullWidth id="username"
          label="Username" name="username" autoComplete="username"
          value={username} onChange={e => onUsernameChange(e.target.value)}
          disabled={loading}
        />
        <PasswordField
          value={password} onChange={onPasswordChange} disabled={loading}
        />
        <Button type="submit" fullWidth variant="contained"
          className={s.submitBtn} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
        <Button type="button" fullWidth variant="outlined"
          className={s.turboBtn} onClick={onTurboLogin} disabled={loading}>
          ⚡ Turbologin
        </Button>
      </form>
    </>
  );
}
