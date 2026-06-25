/**
 * ErrorRepairService — AI-powered code error detection and repair.
 * Detection: error-detector.ts | Repair: error-repair-helpers.ts
 */
import { CodeError, ErrorRepairResult } from '@/types/errors'
import { ProjectFile } from '@/types/project'
import { detectErrors } from './error-detector'
import {
  repairCode,
  repairMultipleFiles,
  repairWithContext,
} from './error-repair-helpers'

export { detectErrors }

export class ErrorRepairService {
  static async detectErrors(
    file: ProjectFile,
  ): Promise<CodeError[]> {
    return detectErrors(file)
  }

  static async repairCode(
    file: ProjectFile,
    errors: CodeError[],
  ): Promise<ErrorRepairResult> {
    return repairCode(file, errors)
  }

  static async repairMultipleFiles(
    files: ProjectFile[],
    allErrors: CodeError[],
  ): Promise<Map<string, ErrorRepairResult>> {
    return repairMultipleFiles(
      files, allErrors, repairCode,
    )
  }

  static async repairWithContext(
    file: ProjectFile,
    errors: CodeError[],
    relatedFiles: ProjectFile[],
  ): Promise<ErrorRepairResult> {
    return repairWithContext(file, errors, relatedFiles)
  }
}
