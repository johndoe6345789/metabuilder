import { createContext, useContext } from 'react'
import { MAX_RENDER_DEPTH, MAX_DEPTH_ERRORS, MAX_RENDERS_PER_FRAME } from './constants'

const RenderDepthContext = createContext(0)

/**
 * Module-level counters, reset once per animation frame.
 * - renderCount:     total JSONUIRenderer calls this frame
 * - depthErrorCount: how many depth-exceeded fallbacks shown this frame
 * - halted:          once renderCount > MAX_RENDERS_PER_FRAME, stop all rendering
 */
let renderCount = 0
let depthErrorCount = 0
let halted = false
let resetScheduled = false

function scheduleReset() {
  if (resetScheduled) return
  resetScheduled = true
  const reset = () => {
    renderCount = 0
    depthErrorCount = 0
    halted = false
    resetScheduled = false
  }
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(reset)
  } else {
    setTimeout(reset, 0) // SSR / test fallback
  }
}

/**
 * Called at the top of every JSONUIRenderer invocation.
 * Returns true if rendering should bail out (frame budget exhausted).
 */
export function trackRender(): boolean {
  renderCount++
  scheduleReset()
  if (renderCount > MAX_RENDERS_PER_FRAME) {
    if (!halted) {
      halted = true
      console.error(
        `[JSON-UI] Render budget exhausted: ${renderCount} renders in one frame (max ${MAX_RENDERS_PER_FRAME}). ` +
        `This usually indicates an infinite re-render loop. Halting all rendering until next frame.`
      )
    }
    return true
  }
  return false
}

/**
 * Returns the current render depth and a provider that increments it.
 * Every recursive renderer calls this once at the top. If `exceeded` is
 * true the renderer should bail out with <DepthLimitFallback />.
 */
export function useRenderDepth() {
  const depth = useContext(RenderDepthContext)
  const exceeded = depth >= MAX_RENDER_DEPTH

  function DepthProvider({ children }: { children: React.ReactNode }) {
    return (
      <RenderDepthContext.Provider value={depth + 1}>
        {children}
      </RenderDepthContext.Provider>
    )
  }

  return { depth, exceeded, DepthProvider } as const
}

/**
 * Visible fallback when component nesting exceeds MAX_RENDER_DEPTH.
 * After MAX_DEPTH_ERRORS (default 10) are shown in the same frame,
 * all subsequent fallbacks return null silently to prevent UI flooding.
 */
export function DepthLimitFallback({ componentId }: { componentId?: string }) {
  const { depth } = useRenderDepth()

  depthErrorCount++
  scheduleReset()

  if (depthErrorCount > MAX_DEPTH_ERRORS) return null
  if (process.env.NODE_ENV === 'production') return null

  const isLast = depthErrorCount === MAX_DEPTH_ERRORS

  return (
    <div
      style={{
        padding: '4px 8px',
        fontSize: '11px',
        color: 'var(--mat-sys-error, #b00020)',
        backgroundColor: 'var(--mat-sys-error-container, #fdecea)',
        borderRadius: '4px',
        border: '1px dashed var(--mat-sys-error, #b00020)',
      }}
    >
      {isLast
        ? `Render depth limit reached (${depth}). Suppressing further errors.`
        : `Render depth limit reached (${depth})${componentId ? ` at "${componentId}"` : ''}`}
    </div>
  )
}
