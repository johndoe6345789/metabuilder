'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { usePersistGate } from '@metabuilder/redux-persist';
import { Toaster } from '@metabuilder/components/fakemui';
import { store, persistor } from '@/store';
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

function PersistGate({ children }: { children: React.ReactNode }) {
  const isRehydrated = usePersistGate(persistor);

  if (!isRehydrated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}

function StorageInitializer() {
  useEffect(() => {
    loadStorageConfig();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate>
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
      </PersistGate>
    </Provider>
  );
}
