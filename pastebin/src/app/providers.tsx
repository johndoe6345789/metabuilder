'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { Toaster } from '@/components/ui/sonner';
import { store } from '@/store';
import { ErrorFallback } from '@/components/error/ErrorFallback';
import { NavigationProvider } from '@/components/layout/navigation/NavigationProvider';
import { useEffect } from 'react';
import { loadStorageConfig } from '@/lib/storage';

const logErrorToConsole = (error: Error, info: { componentStack?: string }) => {
  console.error('Application Error:', error);
  if (info.componentStack) {
    console.error('Component Stack:', info.componentStack);
  }
};

function StorageInitializer() {
  useEffect(() => {
    loadStorageConfig();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={logErrorToConsole}
      >
        <NavigationProvider>
          <StorageInitializer />
          {children}
          <Toaster />
        </NavigationProvider>
      </ErrorBoundary>
    </Provider>
  );
}
