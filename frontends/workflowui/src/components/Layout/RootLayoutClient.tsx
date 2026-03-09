'use client';

/**
 * Root Layout Client Component
 * Wraps the Redux provider, service adapters, i18n, and client-side components.
 * Includes PersistGate to delay rendering until persisted state (auth, ui,
 * project, workspace) has been rehydrated from IndexedDB.
 */

import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { usePersistGate } from '@metabuilder/redux-persist';
import { store, persistor } from '../../store/store';
import { I18nProvider } from '../../hooks/I18nContext';
import {
  ServiceProvider,
  DefaultProjectServiceAdapter,
  DefaultWorkspaceServiceAdapter,
  DefaultWorkflowServiceAdapter,
  DefaultExecutionServiceAdapter,
  DefaultAuthServiceAdapter,
} from '@metabuilder/service-adapters';
import MainLayout from './MainLayout';
import { NotificationAdapter } from '../UI/NotificationAdapter';
import { LoadingOverlay } from '../UI/LoadingOverlay';
import { AuthInitializer } from '../Auth/AuthInitializer';
import { ErrorBoundary } from '../ErrorBoundary';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

/**
 * Inner component that uses the usePersistGate hook.
 * Must be rendered inside <Provider> so the hook can subscribe to the persistor.
 */
function PersistGate({ children }: { children: React.ReactNode }) {
  const isRehydrated = usePersistGate(persistor);

  if (!isRehydrated) {
    return <LoadingOverlay />;
  }

  return <>{children}</>;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  // Memoize service adapters to avoid recreating on each render
  const services = useMemo(() => ({
    projectService: new DefaultProjectServiceAdapter('/api'),
    workspaceService: new DefaultWorkspaceServiceAdapter('/api'),
    workflowService: new DefaultWorkflowServiceAdapter('/api'),
    executionService: new DefaultExecutionServiceAdapter('/api'),
    authService: new DefaultAuthServiceAdapter('/api'),
  }), []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate>
          <ServiceProvider services={services}>
            <I18nProvider>
              <AuthInitializer />
              <MainLayout showSidebar={true}>
                {children}
              </MainLayout>
              <NotificationAdapter />
            </I18nProvider>
          </ServiceProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}
