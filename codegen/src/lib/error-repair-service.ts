/// <reference path="../global.d.ts" />

import { CodeError, ErrorRepairResult } from '@/types/errors'
import { ProjectFile } from '@/types/project'
import { ProtectedLLMService } from './protected-llm-service'

/**
 * ErrorRepairService - AI-powered code error detection and repair
 * 
 * Features:
 * - detectErrors: Scans files for syntax, import, type, and lint errors
 * - repairCode: Fixes errors in a single file using AI
 * - repairMultipleFiles: Batch repair multiple files with errors
 * - repairWithContext: Context-aware repair using related files for better accuracy
 * 
 * Error Types Detected:
 * - Syntax errors (missing parentheses, unbalanced braces)
 * - Import errors (unused imports)
 * - Type errors (use of 'any' type)
 * - Lint errors (var instead of const/let)
 */
export class ErrorRepairService {
  static async detectErrors(file: ProjectFile): Promise<CodeError[]> {
    const errors: CodeError[] = []
    
    const syntaxErrors = this.detectSyntaxErrors(file)
    const importErrors = this.detectImportErrors(file)
    const typeErrors = this.detectBasicTypeErrors(file)
    
    return [...syntaxErrors, ...importErrors, ...typeErrors]
  }

  private static detectSyntaxErrors(file: ProjectFile): CodeError[] {
    const errors: CodeError[] = []
    const lines = file.content.split('\n')
    
    lines.forEach((line, index) => {
      if (file.language === 'typescript' || file.language === 'javascript') {
        if (line.includes('function') && !line.includes('(') && line.includes('{')) {
          errors.push({
            id: `syntax-${file.id}-${index}`,
            fileId: file.id,
            fileName: file.name,
            filePath: file.path,
            line: index + 1,
            message: 'Function declaration missing parentheses',
            severity: 'error',
            type: 'syntax',
            code: line.trim(),
          })
        }
        
        const openBraces = (line.match(/{/g) || []).length
        const closeBraces = (line.match(/}/g) || []).length
        if (openBraces !== closeBraces && !line.trim().startsWith('//')) {
          const nextLine = lines[index + 1]
          if (nextLine && !nextLine.includes('}') && !nextLine.includes('{')) {
            errors.push({
              id: `syntax-${file.id}-${index}`,
              fileId: file.id,
              fileName: file.name,
              filePath: file.path,
              line: index + 1,
              message: 'Possible unbalanced braces',
              severity: 'warning',
              type: 'syntax',
              code: line.trim(),
            })
          }
        }
      }
    })
    
    return errors
  }

  private static detectImportErrors(file: ProjectFile): CodeError[] {
    const errors: CodeError[] = []
    const lines = file.content.split('\n')
    
    const importedNames = new Set<string>()
    const usedNames = new Set<string>()
    
    lines.forEach((line, index) => {
      if (line.trim().startsWith('import ')) {
        const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from/)
        if (importMatch) {
          const namedImports = importMatch[1]
          const defaultImport = importMatch[2]
          
          if (namedImports) {
            namedImports.split(',').forEach(name => {
              importedNames.add(name.trim().split(' as ')[0])
            })
          }
          if (defaultImport) {
            importedNames.add(defaultImport.trim())
          }
        }
      } else {
        importedNames.forEach(name => {
          const regex = new RegExp(`\\b${name}\\b`)
          if (regex.test(line)) {
            usedNames.add(name)
          }
        })
      }
    })
    
    importedNames.forEach(name => {
      if (!usedNames.has(name)) {
        errors.push({
          id: `import-${file.id}-${name}`,
          fileId: file.id,
          fileName: file.name,
          filePath: file.path,
          message: `Unused import: ${name}`,
          severity: 'warning',
          type: 'import',
        })
      }
    })
    
    return errors
  }

  private static detectBasicTypeErrors(file: ProjectFile): CodeError[] {
    const errors: CodeError[] = []
    
    if (file.language !== 'typescript') return errors
    
    const lines = file.content.split('\n')
    
    lines.forEach((line, index) => {
      if (line.includes('any') && !line.trim().startsWith('//')) {
        errors.push({
          id: `type-${file.id}-${index}`,
          fileId: file.id,
          fileName: file.name,
          filePath: file.path,
          line: index + 1,
          message: 'Use of "any" type - consider using a more specific type',
          severity: 'warning',
          type: 'type',
          code: line.trim(),
        })
      }
      
      const varMatch = line.match(/\bvar\s+/)
      if (varMatch) {
        errors.push({
          id: `lint-${file.id}-${index}`,
          fileId: file.id,
          fileName: file.name,
          filePath: file.path,
          line: index + 1,
          message: 'Use "const" or "let" instead of "var"',
          severity: 'warning',
          type: 'lint',
          code: line.trim(),
        })
      }
    })
    
    return errors
  }

  static async repairCode(file: ProjectFile, errors: CodeError[]): Promise<ErrorRepairResult> {
    if (errors.length === 0) {
      return {
        success: true,
        fixedCode: file.content,
        explanation: 'No errors detected',
      }
    }

    try {
      const errorDescriptions = errors
        .map(err => `Line ${err.line || 'unknown'}: ${err.message} - "${err.code || 'N/A'}"`)
        .join('\n')

      const result = await ProtectedLLMService.safeLLMCall(
        window.spark.llmPrompt`You are a code repair assistant. Fix the following errors in this code:

File: ${file.name} (${file.language})

Errors:
${errorDescriptions}

Original code:
\`\`\`${file.language}
${file.content}
\`\`\`

Return a valid JSON object with the following structure:
{
  "fixedCode": "the complete fixed code here",
  "explanation": "brief explanation of what was fixed",
  "remainingIssues": ["any issues that couldn't be fixed"]
}

Rules:
- Fix all syntax errors, import errors, and type errors
- Remove unused imports
- Replace "any" types with appropriate types
- Replace "var" with "const" or "let"
- Maintain code functionality and structure
- Keep the same imports style and formatting
- Return the COMPLETE file content, not just the fixes`,
        { jsonMode: true, priority: 'high', category: 'repair-code' }
      )

      if (result) {
        const parsed = JSON.parse(result)
        return {
          success: true,
          fixedCode: parsed.fixedCode,
          explanation: parsed.explanation,
          remainingIssues: parsed.remainingIssues || [],
        }
      }

      return {
        success: false,
        explanation: 'Failed to repair code automatically',
      }
    } catch (error) {
      console.error('Auto-repair failed:', error)
      return {
        success: false,
        explanation: 'Failed to repair code automatically',
      }
    }
  }

  static async repairMultipleFiles(files: ProjectFile[], allErrors: CodeError[]): Promise<Map<string, ErrorRepairResult>> {
    const results = new Map<string, ErrorRepairResult>()

    const fileErrorMap = new Map<string, CodeError[]>()
    allErrors.forEach(error => {
      if (!fileErrorMap.has(error.fileId)) {
        fileErrorMap.set(error.fileId, [])
      }
      fileErrorMap.get(error.fileId)!.push(error)
    })

    for (const file of files) {
      const fileErrors = fileErrorMap.get(file.id) || []
      if (fileErrors.length > 0) {
        const result = await this.repairCode(file, fileErrors)
        results.set(file.id, result)
      }
    }

    return results
  }

  static async repairWithContext(
    file: ProjectFile,
    errors: CodeError[],
    relatedFiles: ProjectFile[]
  ): Promise<ErrorRepairResult> {
    if (errors.length === 0) {
      return {
        success: true,
        fixedCode: file.content,
        explanation: 'No errors detected',
      }
    }

    try {
      const errorDescriptions = errors
        .map(err => `Line ${err.line || 'unknown'}: ${err.message} - "${err.code || 'N/A'}"`)
        .join('\n')

      const relatedFilesContext = relatedFiles
        .map(f => `${f.path}:\n\`\`\`${f.language}\n${f.content.slice(0, 500)}...\n\`\`\``)
        .join('\n\n')

      const result = await ProtectedLLMService.safeLLMCall(
        window.spark.llmPrompt`You are a code repair assistant. Fix the following errors in this code, considering the context of related files:

File: ${file.name} (${file.language})

Errors:
${errorDescriptions}

Related files for context:
${relatedFilesContext}

Original code to fix:
\`\`\`${file.language}
${file.content}
\`\`\`

Return a valid JSON object with the following structure:
{
  "fixedCode": "the complete fixed code here",
  "explanation": "brief explanation of what was fixed",
  "remainingIssues": ["any issues that couldn't be fixed"]
}

Rules:
- Fix all syntax errors, import errors, and type errors
- Ensure imports match what's exported in related files
- Use consistent naming and patterns from related files
- Replace "any" types with appropriate types from context
- Maintain code functionality and structure
- Return the COMPLETE file content, not just the fixes`,
        { jsonMode: true, priority: 'high', category: 'repair-with-context' }
      )

      if (result) {
        const parsed = JSON.parse(result)
        return {
          success: true,
          fixedCode: parsed.fixedCode,
          explanation: parsed.explanation,
          remainingIssues: parsed.remainingIssues || [],
        }
      }

      return {
        success: false,
        explanation: 'Failed to repair code automatically',
      }
    } catch (error) {
      console.error('Auto-repair with context failed:', error)
      return {
        success: false,
        explanation: 'Failed to repair code automatically',
      }
    }
  }
}
