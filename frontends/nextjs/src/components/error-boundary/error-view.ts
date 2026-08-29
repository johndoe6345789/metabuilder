/** Everything the fallback needs to render one caught error. */

import type { ErrorCategory } from '@/lib/error-reporting'
import type { CategoryColors } from './error-boundary-presentation'

export interface ErrorView {
  error: Error | null
  category: ErrorCategory
  icon: string
  colors: CategoryColors
  userMessage: string
  errorCount: number
  retryCount: number
  nextRetryIn: number
  autoRetryScheduled: boolean
  maxAutoRetries?: number
  showSupportInfo: boolean
  supportEmail: string
}
