'use client';

import { useState } from 'react';
import { IconButton, TextField, Visibility, VisibilityOff } from '@metabuilder/components/m3';

type PasswordFieldProps = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export default function PasswordField({
  value,
  onChange,
  disabled,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      margin="normal"
      required
      fullWidth
      name="password"
      label="Password"
      type={showPassword ? 'text' : 'password'}
      id="password"
      autoComplete="current-password"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      endAdornment={(
        <IconButton
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword(s => !s)}
          onMouseDown={e => e.preventDefault()}
          disabled={disabled}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      )}
    />
  );
}
