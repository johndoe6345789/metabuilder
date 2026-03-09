/**
 * Register Page
 * User registration with FakeMUI Material Design 3 components
 */

'use client';

import React, { useState } from 'react';
import { Button, TextField, Alert, Box } from '@metabuilder/fakemui';
import { AuthFormLayout } from '@/../../../components/layout';
import { PasswordStrengthIndicator } from '@/../../../components/feedback';
import {
  useAuthForm,
  usePasswordValidation,
  useRegisterLogic
} from '../../hooks';

export default function RegisterPage() {
  const { email, password, localError, isLoading, errorMessage, setEmail, setPassword, clearErrors } = useAuthForm();
  const { passwordStrength, validatePassword, handlePasswordChange } = usePasswordValidation();
  const { handleRegister } = useRegisterLogic();

  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    try {
      await handleRegister({
        name,
        email,
        password,
        confirmPassword
      });
    } catch {
      // Error is handled by hook
    }
  };

  const onPasswordChange = (value: string) => {
    setPassword(value);
    handlePasswordChange(value);
  };

  return (
    <AuthFormLayout
      title="WorkflowUI"
      subtitle="Create your account"
      footerText="Already have an account?"
      footerLinkHref="/login"
      footerLinkText="Sign in"
    >
      <Box component="form" onSubmit={onRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          data-testid="name-input"
        />

        <TextField
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
          data-testid="email-input"
        />

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
            hint="At least 8 characters with uppercase, lowercase, and numbers"
          />
        </Box>

        <TextField
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
          data-testid="confirm-password-input"
        />

        {(localError || errorMessage) && (
          <Alert severity="error" data-testid="error-alert">
            {localError || errorMessage}
          </Alert>
        )}

        <Button
          variant="filled"
          type="submit"
          loading={isLoading}
          fullWidth
          data-testid="register-button"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </Box>
    </AuthFormLayout>
  );
}
