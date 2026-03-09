import { useState } from 'react'

import appStrings from '@/data/app-shortcuts.json'
import { getPageShortcuts } from '@/config/page-loader'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import type { FeatureToggles } from '@/types/project'

interface UseAppShortcutsParams {
  featureToggles: FeatureToggles
  navigateToPage: (page: string) => void
}

export default function useAppShortcuts({
  featureToggles,
  navigateToPage,
}: UseAppShortcutsParams) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const shortcuts = getPageShortcuts(featureToggles)

  useKeyboardShortcuts([
    ...shortcuts.map(s => ({
      key: s.key,
      ctrl: s.ctrl,
      shift: s.shift,
      description: s.description,
      action: () => {
        console.log('[APP_ROUTER] ⌨️ Shortcut triggered, navigating to:', s.action)
        navigateToPage(s.action)
      },
    })),
    {
      key: 'k',
      ctrl: true,
      description: appStrings.shortcuts.search,
      action: () => {
        console.log('[APP_ROUTER] ⌨️ Search shortcut triggered')
        setSearchOpen(true)
      },
    },
    {
      key: '/',
      ctrl: true,
      description: appStrings.shortcuts.shortcuts,
      action: () => {
        console.log('[APP_ROUTER] ⌨️ Shortcuts dialog triggered')
        setShortcutsOpen(true)
      },
    },
    {
      key: 'p',
      ctrl: true,
      description: appStrings.shortcuts.preview,
      action: () => {
        console.log('[APP_ROUTER] ⌨️ Preview shortcut triggered')
        setPreviewOpen(true)
      },
    },
  ])

  return {
    searchOpen,
    setSearchOpen,
    shortcutsOpen,
    setShortcutsOpen,
    previewOpen,
    setPreviewOpen,
  }
}
