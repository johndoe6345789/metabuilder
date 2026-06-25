/**
 * MaterialLoginForm - Material Design 3 login form
 */

'use client';

import React from 'react';
import {
  Button,
  Alert,
  Box,
} from '@metabuilder/m3';
import { AuthFormLayout } from '@metabuilder/components/layout';
import MaterialLoginFields from './MaterialLoginFields';

interface MaterialLoginFormProps {
  email: string;
  password: string;
  isLoading: boolean;
  localError: string | null;
  errorMessage: string | null;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTurboLogin: () => void;
  onSwitchToSalesforce: () => void;
}

export default function MaterialLoginForm({
  email,
  password,
  isLoading,
  localError,
  errorMessage,
  setEmail,
  setPassword,
  onSubmit,
  onTurboLogin,
  onSwitchToSalesforce,
}: MaterialLoginFormProps) {
  return (
    <AuthFormLayout
      title="WorkflowUI"
      subtitle="Sign in to your account"
      footerText="Don't have an account?"
      footerLinkHref="/register"
      footerLinkText="Sign up"
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <MaterialLoginFields
          email={email}
          password={password}
          isLoading={isLoading}
          setEmail={setEmail}
          setPassword={setPassword}
        />

        {(localError || errorMessage) && (
          <Alert severity="error" data-testid="error-alert">
            {localError || errorMessage}
          </Alert>
        )}

        <Button
          type="submit"
          variant="filled"
          fullWidth
          loading={isLoading}
          data-testid="login-button"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={onTurboLogin}
          data-testid="turbo-login-button"
        >
          ⚡ Turbologin
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <button
            type="button"
            onClick={onSwitchToSalesforce}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--mat-sys-primary)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
            data-testid="switch-to-salesforce"
          >
            Switch to Salesforce Style
          </button>
        </Box>
      </Box>
    </AuthFormLayout>
  );
}
