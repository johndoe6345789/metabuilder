/**
 * RegisterFormFields - Name, email, password and confirm fields
 */

'use client';

import React from 'react';
import { TextField } from '@metabuilder/fakemui';
import PasswordFieldWithStrength from './PasswordFieldWithStrength';

interface RegisterFormFieldsProps {
  name: string;
  email: string;
  confirmPassword: string;
  password: string;
  isLoading: boolean;
  passwordStrength: number;
  validatePassword: (p: string) => boolean;
  onPasswordChange: (p: string) => void;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  setConfirmPassword: (v: string) => void;
}

export default function RegisterFormFields({
  name,
  email,
  confirmPassword,
  password,
  isLoading,
  passwordStrength,
  validatePassword,
  onPasswordChange,
  setName,
  setEmail,
  setConfirmPassword,
}: RegisterFormFieldsProps) {
  return (
    <>
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
      <PasswordFieldWithStrength
        password={password}
        isLoading={isLoading}
        passwordStrength={passwordStrength}
        validatePassword={validatePassword}
        onPasswordChange={onPasswordChange}
      />
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
    </>
  );
}
