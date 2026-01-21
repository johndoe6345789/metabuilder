import { useState, useEffect } from 'react'
import { loadRecharts, loadD3, loadThree, loadReactFlow } from '@/lib/library-loader'

type LoadState<T> = {
  library: T | null
  loading: boolean
  error: Error | null
}

export function useRecharts() {
  const [state, setState] = useState<LoadState<typeof import('recharts')>>({
    library: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    console.log('[HOOK] 🎨 useRecharts: Starting load')
    let mounted = true

    loadRecharts()
      .then(recharts => {
        if (mounted) {
          console.log('[HOOK] ✅ useRecharts: Loaded successfully')
          setState({ library: recharts, loading: false, error: null })
        }
      })
      .catch(error => {
        if (mounted) {
          console.error('[HOOK] ❌ useRecharts: Load failed', error)
          setState({ library: null, loading: false, error })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return state
}

export function useD3() {
  const [state, setState] = useState<LoadState<typeof import('d3')>>({
    library: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    console.log('[HOOK] 📊 useD3: Starting load')
    let mounted = true

    loadD3()
      .then(d3 => {
        if (mounted) {
          console.log('[HOOK] ✅ useD3: Loaded successfully')
          setState({ library: d3, loading: false, error: null })
        }
      })
      .catch(error => {
        if (mounted) {
          console.error('[HOOK] ❌ useD3: Load failed', error)
          setState({ library: null, loading: false, error })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return state
}

export function useThree() {
  const [state, setState] = useState<LoadState<typeof import('three')>>({
    library: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    console.log('[HOOK] 🎮 useThree: Starting load')
    let mounted = true

    loadThree()
      .then(three => {
        if (mounted) {
          console.log('[HOOK] ✅ useThree: Loaded successfully')
          setState({ library: three, loading: false, error: null })
        }
      })
      .catch(error => {
        if (mounted) {
          console.error('[HOOK] ❌ useThree: Load failed', error)
          setState({ library: null, loading: false, error })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return state
}

export function useReactFlow() {
  const [state, setState] = useState<LoadState<typeof import('reactflow')>>({
    library: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    console.log('[HOOK] 🔀 useReactFlow: Starting load')
    let mounted = true

    loadReactFlow()
      .then(reactflow => {
        if (mounted) {
          console.log('[HOOK] ✅ useReactFlow: Loaded successfully')
          setState({ library: reactflow, loading: false, error: null })
        }
      })
      .catch(error => {
        if (mounted) {
          console.error('[HOOK] ❌ useReactFlow: Load failed', error)
          setState({ library: null, loading: false, error })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return state
}
