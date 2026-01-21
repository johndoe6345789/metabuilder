import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, X, DeviceMobile, Desktop } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/use-pwa'

export function PWAInstallPrompt() {
  const {
    isInstallable,
    isInstallPromptDismissed,
    isInstallPromptVisible,
    installApp,
    dismissInstallPrompt,
  } = usePWA()

  const handleInstall = async () => {
    const success = await installApp()
    if (success) return
  }

  const handleDismiss = () => {
    dismissInstallPrompt()
  }

  return (
    <AnimatePresence>
      {isInstallable && !isInstallPromptDismissed && isInstallPromptVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="p-6 shadow-lg border-2 border-primary/20 bg-card/95 backdrop-blur">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Download size={24} weight="duotone" className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">Install CodeForge</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1"
                    onClick={handleDismiss}
                  >
                    <X size={16} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Install our app for a faster, offline-capable experience with quick access from your device.
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Desktop size={16} />
                    <span>Works offline</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DeviceMobile size={16} />
                    <span>Quick access</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleInstall} className="flex-1">
                    <Download size={16} className="mr-2" />
                    Install
                  </Button>
                  <Button variant="outline" onClick={handleDismiss}>
                    Not now
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
