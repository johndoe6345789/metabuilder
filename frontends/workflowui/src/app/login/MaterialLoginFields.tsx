/**
 * MaterialLoginFields - Email and password input fields
 */

'use client';

import React from 'react';
import { TextField } from '@metabuilder/m3';

interface MaterialLoginFieldsProps {
  email: string;
  password: string;
  isLoading: boolean;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
}

export default function MaterialLoginFields({
  email,
  password,
  isLoading,
  setEmail,
  setPassword,
}: MaterialLoginFieldsProps) {
  return (
    <>
      <TextField
        label="Email Address"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        autoComplete="email"
        required
        data-testid="email-input"
      />
      <TextField
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        autoComplete="current-password"
        required
        data-testid="password-input"
      />
    </>
  );
}
