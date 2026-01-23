/**
 * useLoginLogic Hook
 * Business logic for user login including validation and API calls
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setAuthenticated, setLoading, setError } from '../store/slices/authSlice';
import { authService } from '../services/authService';

export interface LoginData {
  email: string;
  password: string;
}

export interface UseLoginLogicReturn {
  handleLogin: (data: LoginData) => Promise<void>;
}

/**
 * Validation rules for login form
 */
const validateLogin = (data: LoginData): string | null => {
  const { email, password } = data;

  if (!email.trim()) {
    return 'Email is required';
  }
  if (!password) {
    return 'Password is required';
  }

  return null;
};

/**
 * Custom hook for user login logic
 * Handles validation, API calls, and state management
 */
export const useLoginLogic = (): UseLoginLogicReturn => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = useCallback(
    async (data: LoginData) => {
      dispatch(setError(null));
      dispatch(setLoading(true));

      try {
        // Validate form
        const validationError = validateLogin(data);
        if (validationError) {
          throw new Error(validationError);
        }

        // Call API
        const response = await authService.login(data.email, data.password);

        // Save to localStorage for persistence
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));

        // Update Redux state
        dispatch(
          setAuthenticated({
            user: response.user,
            token: response.token
          })
        );

        // Redirect to dashboard
        router.push('/');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        dispatch(setError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, router]
  );

  return { handleLogin };
};
