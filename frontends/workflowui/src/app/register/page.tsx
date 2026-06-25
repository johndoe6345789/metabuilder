/**
 * Register Page
 * User registration with FakeMUI Material Design 3 components
 */

'use client';

import React from 'react';
import {
  Button,
  Alert,
  Box,
} from '@metabuilder/m3';
import { AuthFormLayout } from '@/../../../components/layout';
import { useRegisterPage } from './hooks/useRegisterPage';
import RegisterFormFields from './RegisterFormFields';

export default function RegisterPage() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    localError,
    errorMessage,
    passwordStrength,
    validatePassword,
    onPasswordChange,
    onRegisterSubmit,
  } = useRegisterPage();

  return (
    <AuthFormLayout
      title="WorkflowUI"
      subtitle="Create your account"
      footerText="Already have an account?"
      footerLinkHref="/login"
      footerLinkText="Sign in"
    >
      <Box
        component="form"
        onSubmit={onRegisterSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <RegisterFormFields
          name={name}
          email={email}
          confirmPassword={confirmPassword}
          password={password}
          isLoading={isLoading}
          passwordStrength={passwordStrength}
          validatePassword={validatePassword}
          onPasswordChange={onPasswordChange}
          setName={setName}
          setEmail={setEmail}
          setConfirmPassword={setConfirmPassword}
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
