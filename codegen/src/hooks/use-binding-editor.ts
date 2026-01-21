import { useState } from 'react'
import type { Binding } from '@/types/json-ui'

export function useBindingEditor(
  bindings: Record<string, Binding>,
  onChange: (bindings: Record<string, Binding>) => void
) {
  const [selectedProp, setSelectedProp] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [path, setPath] = useState('')

  const addBinding = () => {
    if (!selectedProp || !selectedSource) return

    const newBindings = {
      ...bindings,
      [selectedProp]: {
        source: selectedSource,
        ...(path && { path }),
      },
    }

    onChange(newBindings)
    setSelectedProp('')
    setSelectedSource('')
    setPath('')
  }

  const removeBinding = (prop: string) => {
    const newBindings = { ...bindings }
    delete newBindings[prop]
    onChange(newBindings)
  }

  return {
    selectedProp,
    setSelectedProp,
    selectedSource,
    setSelectedSource,
    path,
    setPath,
    addBinding,
    removeBinding,
  }
}
