'use client';

import { Provider } from 'react-redux';
import { usePersistGate } from '@metabuilder/redux-persist';
import { store, persistor } from '@/store';

function PersistGate({ children }: { children: React.ReactNode }) {
  const isRehydrated = usePersistGate(persistor);
  if (!isRehydrated) return null;
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate>{children}</PersistGate>
    </Provider>
  );
}
