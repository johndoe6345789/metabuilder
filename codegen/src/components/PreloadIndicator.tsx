import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightning } from '@phosphor-icons/react'
import { routePreloadManager } from '@/lib/route-preload-manager'

export function PreloadIndicator() {
  const [stats, setStats] = useState(routePreloadManager.getStats())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const newStats = routePreloadManager.getStats()
      setStats(newStats)
      setVisible(newStats.activePreloads > 0 || newStats.queuedCount > 0)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50 pointer-events-none"
        >
          <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Lightning size={16} weight="fill" className="text-primary" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                Preloading routes
              </span>
              {stats.queuedCount > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {stats.queuedCount} in queue
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
