/**
 * usePasswordValidation Hook
 * Password validation and strength calculation logic
 */

import { useState, useCallback } from 'react';

export interface PasswordValidationResult {
  score: number;
  message: string;
}

export interface UsePasswordValidationReturn {
  passwordStrength: number;
  validatePassword: (pwd: string) => PasswordValidationResult;
  handlePasswordChange: (value: string) => void;
}

/**
 * Custom hook for password validation
 * Provides password strength scoring and validation rules
 */
export const usePasswordValidation = (): UsePasswordValidationReturn => {
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validatePassword = useCallback((pwd: string): PasswordValidationResult => {
    let score = 0;
    let message = '';

    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;

    if (score === 0) message = 'Enter a password';
    else if (score === 1) message = 'Weak';
    else if (score === 2) message = 'Fair';
    else if (score === 3) message = 'Good';
    else message = 'Strong';

    return { score, message };
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    const { score } = validatePassword(value);
    setPasswordStrength(score);
  }, [validatePassword]);

  return {
    passwordStrength,
    validatePassword,
    handlePasswordChange
  };
};
