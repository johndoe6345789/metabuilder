import { BrowserRouter } from 'react-router-dom'

import AppRouterLayout from '@/components/app/AppRouterLayout'
import LoadingScreen from '@/components/app/LoadingScreen'
import { useAppBootstrap } from '@/hooks/use-app-bootstrap'

export default function AppRouterBootstrap() {
  const { appReady } = useAppBootstrap()

  if (!appReady) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <AppRouterLayout />
    </BrowserRouter>
  )
}
