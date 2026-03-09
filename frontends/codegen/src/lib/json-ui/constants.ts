/** Maximum component nesting depth before rendering stops (20 covers any realistic UI tree) */
export const MAX_RENDER_DEPTH = 20

/** Maximum items rendered in a single loop iteration */
export const MAX_LOOP_ITERATIONS = 500

/** Maximum depth-exceeded errors shown before suppressing further fallback boxes */
export const MAX_DEPTH_ERRORS = 10

/** Maximum total JSONUIRenderer calls per animation frame before bail-out.
 *  A normal page with ~100 components renders ~200-300 calls.
 *  Complex showcase pages (atomic-library) can legitimately render 1000+.
 *  2000 gives headroom; anything above signals a loop. */
export const MAX_RENDERS_PER_FRAME = 2000
