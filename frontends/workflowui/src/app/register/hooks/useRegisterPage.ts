/**
 * useRegisterPage - State and handlers for the register page
 */

'use client';

import { useState } from 'react';
import {
  useAuthForm,
  usePasswordValidation,
  useRegisterLogic,
} from '../../../hooks';

export function useRegisterPage() {
  const {
    email,
    password,
    localError,
    isLoading,
    errorMessage,
    setEmail,
    setPassword,
    clearErrors,
  } = useAuthForm();

  const {
    passwordStrength,
    validatePassword,
    handlePasswordChange,
  } = usePasswordValidation();

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
        confirmPassword,
      });
    } catch {
      // Error is handled by hook
    }
  };

  const onPasswordChange = (value: string) => {
    setPassword(value);
    handlePasswordChange(value);
  };

  return {
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
  };
}
