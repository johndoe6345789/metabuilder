/**
 * useRegisterLogic Hook
 * Business logic for user registration including validation and API calls
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setAuthenticated, setLoading, setError } from '../store/slices/authSlice';
import { authService } from '../services/authService';

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UseRegisterLogicReturn {
  handleRegister: (data: RegistrationData) => Promise<void>;
}

/**
 * Validation rules for registration form
 */
const validateRegistration = (data: RegistrationData): string | null => {
  const { name, email, password, confirmPassword } = data;

  if (!name.trim()) {
    return 'Name is required';
  }
  if (name.length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (!email.trim()) {
    return 'Email is required';
  }
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain lowercase letters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain uppercase letters';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain numbers';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

/**
 * Custom hook for user registration logic
 * Handles validation, API calls, and state management
 */
export const useRegisterLogic = (): UseRegisterLogicReturn => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleRegister = useCallback(
    async (data: RegistrationData) => {
      dispatch(setError(null));
      dispatch(setLoading(true));

      try {
        // Validate form
        const validationError = validateRegistration(data);
        if (validationError) {
          throw new Error(validationError);
        }

        // Call API
        const response = await authService.register(data.email, data.password, data.name);

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
        const message = error instanceof Error ? error.message : 'Registration failed';
        dispatch(setError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, router]
  );

  return { handleRegister };
};
