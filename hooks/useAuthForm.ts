/**
 * useAuthForm Hook
 * Manages form state and validation for authentication forms (login/register)
 */

import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// useRouter import removed — was unused (dead import)
import { setError, setAuthLoading, selectAuthError, selectAuthLoading } from '@metabuilder/redux-slices';

export interface AuthFormState {
  email: string;
  password: string;
  localError: string;
}

export interface UseAuthFormReturn extends AuthFormState {
  isLoading: boolean;
  errorMessage: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLocalError: (error: string) => void;
  clearErrors: () => void;
}

/**
 * Custom hook for managing auth form state
 * Handles email/password fields and error tracking
 */
export const useAuthForm = (): UseAuthFormReturn => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const errorMessage = useSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const clearErrors = useCallback(() => {
    setLocalError('');
    dispatch(setError(null));
  }, [dispatch]);

  return {
    email,
    password,
    localError,
    isLoading,
    errorMessage,
    setEmail,
    setPassword,
    setLocalError,
    clearErrors
  };
};
