/**
 * detectErrors — aggregates syntax, import, and type checks.
 * Detectors: error-detector-syntax.ts, error-detector-types.ts
 */
import { CodeError } from '@/types/errors'
import { ProjectFile } from '@/types/project'
import { detectSyntaxErrors } from './error-detector-syntax'
import { detectImportErrors } from './error-detector-imports'
import { detectBasicTypeErrors } from './error-detector-types'

export function detectErrors(
  file: ProjectFile,
): CodeError[] {
  return [
    ...detectSyntaxErrors(file),
    ...detectImportErrors(file),
    ...detectBasicTypeErrors(file),
  ]
}
