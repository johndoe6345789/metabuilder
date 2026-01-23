'use client';

/**
 * Root Layout Client Component
 * Wraps the Redux provider and client-side components
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import MainLayout from './MainLayout';
import { NotificationContainer } from '../UI/NotificationContainer';
import { LoadingOverlay } from '../UI/LoadingOverlay';
import { AuthInitializer } from '../Auth/AuthInitializer';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <MainLayout showSidebar={true}>
        {children}
      </MainLayout>
      <NotificationContainer />
      <LoadingOverlay />
    </Provider>
  );
}
