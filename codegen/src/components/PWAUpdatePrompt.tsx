import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CloudArrowDown, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/use-pwa'
import { useState } from 'react'

export function PWAUpdatePrompt() {
  const { isUpdateAvailable, updateApp } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  const handleUpdate = () => {
    updateApp()
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {isUpdateAvailable && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Card className="p-4 shadow-lg border-2 border-accent/20 bg-card/95 backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <CloudArrowDown size={20} weight="duotone" className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold">Update Available</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1"
                    onClick={handleDismiss}
                  >
                    <X size={14} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  A new version is ready. Update now for the latest features and fixes.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdate} className="flex-1">
                    Update Now
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDismiss}>
                    Later
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
