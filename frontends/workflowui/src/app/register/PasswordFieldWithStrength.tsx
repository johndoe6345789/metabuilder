/**
 * PasswordFieldWithStrength - Password input with strength indicator
 */

'use client';

import React from 'react';
import { Box, TextField } from '@metabuilder/fakemui';
import { PasswordStrengthIndicator } from '@/../../../components/feedback';

interface PasswordFieldWithStrengthProps {
  password: string;
  isLoading: boolean;
  passwordStrength: number;
  validatePassword: (p: string) => { message: string };
  onPasswordChange: (v: string) => void;
}

export default function PasswordFieldWithStrength({
  password,
  isLoading,
  passwordStrength,
  validatePassword,
  onPasswordChange,
}: PasswordFieldWithStrengthProps) {
  return (
    <Box>
      <TextField
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        disabled={isLoading}
        autoComplete="new-password"
        data-testid="password-input"
      />
      <PasswordStrengthIndicator
        password={password}
        strength={passwordStrength}
        message={validatePassword(password).message}
        hint="At least 8 characters with uppercase, lowercase,
          and numbers"
      />
    </Box>
  );
}
