/**
 * error-repair-helpers.ts
 *
 * Repair functions for ErrorRepairService.
 */
import { CodeError, ErrorRepairResult } from '@/types/errors'
import { ProjectFile } from '@/types/project'
import { ProtectedLLMService } from './protected-llm-service'
import { llmPrompt } from '@/lib/llm-service'

const REPAIR_RULES = `
- Fix syntax, import, and type errors
- Remove unused imports
- Replace "any" with proper types
- Replace "var" with "const"/"let"
- Keep functionality intact
- Return COMPLETE file content`

const REPAIR_FAILED: ErrorRepairResult = {
  success: false,
  explanation: 'Failed to repair code automatically',
}

function buildErrorList(errors: CodeError[]): string {
  return errors
    .map(
      (e) =>
        `Line ${e.line || 'unknown'}: ${e.message}` +
        ` - "${e.code || 'N/A'}"`,
    )
    .join('\n')
}

function parseResult(raw: string): ErrorRepairResult {
  const p = JSON.parse(raw)
  return {
    success: true,
    fixedCode: p.fixedCode,
    explanation: p.explanation,
    remainingIssues: p.remainingIssues || [],
  }
}

export async function repairCode(
  file: ProjectFile,
  errors: CodeError[],
): Promise<ErrorRepairResult> {
  if (errors.length === 0) {
    return {
      success: true,
      fixedCode: file.content,
      explanation: 'No errors detected',
    }
  }
  try {
    const errList = buildErrorList(errors)
    const result = await ProtectedLLMService.safeLLMCall(
      llmPrompt`Fix errors in this file:
File: ${file.name} (${file.language})
Errors: ${errList}
Code:
\`\`\`${file.language}
${file.content}
\`\`\`
Return JSON: { "fixedCode": "...", "explanation": "...", "remainingIssues": [] }
Rules:${REPAIR_RULES}`,
      { jsonMode: true, priority: 'high',
        category: 'repair-code' },
    )
    return result ? parseResult(result) : REPAIR_FAILED
  } catch (err) {
    console.error('Auto-repair failed:', err)
    return REPAIR_FAILED
  }
}

export async function repairMultipleFiles(
  files: ProjectFile[],
  allErrors: CodeError[],
  repairFn: (
    f: ProjectFile, e: CodeError[]
  ) => Promise<ErrorRepairResult>
): Promise<Map<string, ErrorRepairResult>> {
  const results = new Map<string, ErrorRepairResult>()
  const fileErrorMap = new Map<string, CodeError[]>()
  allErrors.forEach((error) => {
    if (!fileErrorMap.has(error.fileId)) {
      fileErrorMap.set(error.fileId, [])
    }
    fileErrorMap.get(error.fileId)!.push(error)
  })
  for (const file of files) {
    const fileErrors = fileErrorMap.get(file.id) || []
    if (fileErrors.length > 0) {
      results.set(file.id, await repairFn(file, fileErrors))
    }
  }
  return results
}

export async function repairWithContext(
  file: ProjectFile,
  errors: CodeError[],
  relatedFiles: ProjectFile[],
): Promise<ErrorRepairResult> {
  if (errors.length === 0) {
    return {
      success: true,
      fixedCode: file.content,
      explanation: 'No errors detected',
    }
  }
  try {
    const errList = buildErrorList(errors)
    const ctx = relatedFiles
      .map(
        (f) =>
          `${f.path}:\n\`\`\`${f.language}\n` +
          `${f.content.slice(0, 500)}...\n\`\`\``,
      )
      .join('\n\n')
    const result = await ProtectedLLMService.safeLLMCall(
      llmPrompt`Fix errors using related file context:
File: ${file.name} (${file.language})
Errors: ${errList}
Related: ${ctx}
Code:
\`\`\`${file.language}
${file.content}
\`\`\`
Return JSON: { "fixedCode": "...", "explanation": "...", "remainingIssues": [] }
Rules:${REPAIR_RULES}`,
      { jsonMode: true, priority: 'high',
        category: 'repair-with-context' },
    )
    return result ? parseResult(result) : REPAIR_FAILED
  } catch (err) {
    console.error('Auto-repair with context failed:', err)
    return REPAIR_FAILED
  }
}
