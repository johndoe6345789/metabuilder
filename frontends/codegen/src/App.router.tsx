import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store'
import AppRouterLayout from '@/components/app/AppRouterLayout'

export default function AppRouter() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppRouterLayout />
      </PersistGate>
    </Provider>
  )
}
