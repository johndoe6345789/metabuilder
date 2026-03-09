'use client'

import { useLayoutEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectTheme } from '@/store/selectors'

export function ThemeApplier() {
  const theme = useAppSelector(selectTheme)

  useLayoutEffect(() => {
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [theme])

  return null
}
