import { AstExtractedFunction, ExtractedImport } from '../lambda/types'

export function buildAstFunctionContent(func: AstExtractedFunction, imports: ExtractedImport[]): string {
  let content = ''

  if (imports.length > 0) {
    content += imports.map(imp => imp.fullText).join('\n') + '\n\n'
  }

  if (func.leadingComments) {
    content += func.leadingComments + '\n'
  }

  let funcText = func.fullText
  if (!func.isExported && !funcText.includes('export ')) {
    funcText = 'export ' + funcText
  } else if (!funcText.includes('export ')) {
    funcText = 'export ' + funcText
  }

  content += funcText + '\n'

  return content
}
