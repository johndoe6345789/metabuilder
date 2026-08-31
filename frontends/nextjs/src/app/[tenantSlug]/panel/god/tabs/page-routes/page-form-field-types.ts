import type { PageRouteInput } from '@/hooks/usePageRoutes'

/** Shared by every PageFormFields sub-section so each can patch its own
 *  slice of the draft without owning the draft itself. */
export type PageFormOnChange = <K extends keyof PageRouteInput>(
  field: K,
  value: PageRouteInput[K]
) => void
