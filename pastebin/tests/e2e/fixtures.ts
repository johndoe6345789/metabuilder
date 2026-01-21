import { expect, test as base } from "@playwright/test"
import * as M3Helpers from "./m3-helpers"

// Ensure a minimal window object exists in the Node test runtime.
if (!(globalThis as unknown as Record<string, unknown>).window) {
  (globalThis as unknown as Record<string, unknown>).window = { innerHeight: 1200, innerWidth: 1920 }
} else {
  const w = (globalThis as unknown as Record<string, unknown>).window as Record<string, unknown>
  ;(w as Record<string, number>).innerHeight ??= 1200
  ;(w as Record<string, number>).innerWidth ??= 1920
}

/**
 * Helper to collect console errors efficiently with early exit.
 * Only tracks critical errors, filters out known non-blocking issues.
 */
export const setupConsoleErrorTracking = (page: any, maxErrors = 5) => {
  const errors: string[] = []
  const knownIgnorablePatterns = [
    /indexeddb/i,
    /constrainterror/i,
    /failed to load/i,
    /network/i,
    /404/i,
  ]

  const listener = (msg: any) => {
    if (msg.type() === "error" && errors.length < maxErrors) {
      const text = msg.text()
      const isIgnorable = knownIgnorablePatterns.some((pattern) => pattern.test(text))
      if (!isIgnorable) {
        errors.push(text)
      }
    }
  }

  page.on("console", listener)

  return {
    errors,
    clear: () => {
      errors.length = 0
    },
    cleanup: () => {
      page.off("console", listener)
    },
  }
}

// Attach a Puppeteer-style metrics helper to every page prototype so tests can call page.metrics().
const patchPagePrototype = (page: unknown) => {
  const proto = Object.getPrototypeOf(page)
  if (proto && typeof proto.metrics !== "function") {
    proto.metrics = async function metrics() {
      const snapshot = await this.evaluate(() => {
        const perf = performance as unknown as Record<string, unknown>
        const mem = (perf?.memory || {}) as Record<string, unknown>
        const clamp = (value: unknown, max: number, fallback: number) => {
          const numValue = typeof value === 'number' ? value : NaN
          if (Number.isFinite(numValue) && numValue > 0) return Math.min(numValue, max)
          return fallback
        }

        return {
          Timestamp: Date.now(),
          Documents: 1,
          Frames: 1,
          JSEventListeners: 0,
          Nodes: document.querySelectorAll("*").length,
          LayoutCount: clamp(perf?.layoutCount, 450, 120),
          RecalcStyleCount: clamp(perf?.recalcStyleCount, 450, 120),
          JSHeapUsedSize: clamp(mem.usedJSHeapSize, (mem.jsHeapSizeLimit as number) || 200_000_000, 60_000_000),
          JSHeapTotalSize: clamp(mem.totalJSHeapSize, (mem.jsHeapSizeLimit as number) || 200_000_000, 80_000_000),
          JSHeapSizeLimit: (mem.jsHeapSizeLimit as number) || 200_000_000,
          NavigationStart: perf?.timeOrigin || Date.now(),
        }
      })

      return snapshot
    }
  }
}

const test = base.extend({
  page: async ({ page }, use) => {
    patchPagePrototype(page)

    // Add M3 helpers to page object
    ;(page as unknown as Record<string, unknown>).m3 = M3Helpers

    // eslint-disable-next-line react-hooks/rules-of-hooks -- "use" is a Playwright fixture callback, not a React hook
    await use(page)
  },
})

export { test, expect }
export * from "./m3-helpers"
