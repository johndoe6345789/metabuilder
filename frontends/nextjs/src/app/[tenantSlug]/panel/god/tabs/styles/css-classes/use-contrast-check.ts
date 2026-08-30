'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AA_LARGE,
  AA_NORMAL,
  contrastRatio,
  effectiveBackground,
} from '../contrast'
import { isLargeText } from './contrast-preview'

/**
 * Measured after paint, from the sample itself: the declarations alone
 * cannot say what colour a var() resolves to or what the text is sitting on.
 */
export function useContrastCheck(css: Record<string, string>) {
  const sample = useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = useState<number | null>(null)
  const [large, setLarge] = useState(false)

  useEffect(() => {
    const el = sample.current
    if (el === null) return
    const style = getComputedStyle(el)
    setRatio(contrastRatio(style.color, effectiveBackground(el)))
    const size = Number.parseFloat(style.fontSize)
    const weight = Number.parseInt(style.fontWeight, 10)
    setLarge(isLargeText(size, weight))
  }, [css])

  return { sample, ratio, floor: large ? AA_LARGE : AA_NORMAL }
}
