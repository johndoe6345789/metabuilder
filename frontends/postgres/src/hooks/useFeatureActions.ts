/**
 * Hook for creating feature actions from features.json configuration
 */

import { useCallback, useMemo, useState } from 'react';
import { createResourceActions } from '@/utils/actionWiring';

type ActionState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

/**
 * Hook that creates action handlers based on API endpoints defined in features.json
 * Provides automatic loading, error, and success state management
 */
export function useFeatureActions(resourceName: string) {
  const [state, setState] = useState<ActionState>({
    loading: false,
    error: null,
    success: null,
  });

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: null, success: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setSuccess = useCallback((success: string | null) => {
    setState(prev => ({ ...prev, success, loading: false }));
  }, []);

  // Create action handlers with automatic state management
  const actions = useMemo(() => {
    return createResourceActions(resourceName, {
      onSuccess: (actionName, data) => {
        setSuccess(data.message || `${actionName} completed successfully`);
      },
      onError: (actionName, error) => {
        setError(error.message || `${actionName} failed`);
      },
    });
  }, [resourceName, setSuccess, setError]);

  // Wrap each action with loading state
  const wrappedActions = useMemo(() => {
    const wrapped: Record<string, (params?: Record<string, any>) => Promise<any>> = {};

    Object.entries(actions).forEach(([actionName, handler]) => {
      wrapped[actionName] = async (params?: Record<string, any>) => {
        setLoading(true);
        clearMessages();
        try {
          const result = await handler(params);
          return result;
        } catch (error) {
          throw error;
        } finally {
          setLoading(false);
        }
      };
    });

    return wrapped;
  }, [actions, setLoading, clearMessages]);

  return {
    actions: wrappedActions,
    loading: state.loading,
    error: state.error,
    success: state.success,
    clearMessages,
    setLoading,
    setError,
    setSuccess,
  };
}
