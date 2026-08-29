/**
 * The application-wide loader.
 *
 * One instance, because the cache is the point: a loader per caller is a
 * cache per caller, which is no cache at all.
 */

import { WorkflowLoaderV2 } from '../workflow-loader-v2'
import type { WorkflowLoaderV2Options } from './loader-types'

let globalLoader: WorkflowLoaderV2 | null = null

/** Options are honoured on the first call only. */
export function getWorkflowLoader(
  options?: WorkflowLoaderV2Options
): WorkflowLoaderV2 {
  globalLoader ??= new WorkflowLoaderV2(options)
  return globalLoader
}

/** Drops the shared loader, stopping its timer. Chiefly for tests. */
export function resetWorkflowLoader(): void {
  globalLoader?.destroy()
  globalLoader = null
}
