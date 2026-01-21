import { BrowserRouter } from 'react-router-dom'

import AppLayout from '@/components/app/AppLayout'
import LoadingScreen from '@/components/app/LoadingScreen'
import { useAppBootstrap } from '@/hooks/use-app-bootstrap'

export default function AppBootstrap() {
  const { appReady } = useAppBootstrap({ loadComponentTrees: true })

  if (!appReady) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
