import * as ts from 'typescript'
import * as fs from 'fs/promises'
import { AstExtractedFunction, ExtractedImport } from '../lambda/types'
import { convertMethodToFunction } from './convert-method-to-function'

function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

function toClassName(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Utils'
}

export async function analyzeAstFile(filePath: string): Promise<{
  functions: AstExtractedFunction[]
  imports: ExtractedImport[]
  types: string[]
}> {
  const sourceCode = await fs.readFile(filePath, 'utf-8')
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true)

  const functions: AstExtractedFunction[] = []
  const imports: ExtractedImport[] = []
  const types: string[] = []

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false
      const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false

      const leadingComments = ts.getLeadingCommentRanges(sourceCode, node.getFullStart())
      let commentText = ''
      if (leadingComments) {
        for (const comment of leadingComments) {
          commentText += sourceCode.substring(comment.pos, comment.end) + '\n'
        }
      }

      functions.push({
        name: node.name.text,
        fullText: node.getText(sourceFile),
        isExported,
        isAsync,
        leadingComments: commentText.trim(),
        startPos: node.getStart(sourceFile),
        endPos: node.getEnd(),
      })
    }

    if (ts.isClassDeclaration(node) && node.members) {
      for (const member of node.members) {
        if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
          const isAsync = member.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false

          const leadingComments = ts.getLeadingCommentRanges(sourceCode, member.getFullStart())
          let commentText = ''
          if (leadingComments) {
            for (const comment of leadingComments) {
              commentText += sourceCode.substring(comment.pos, comment.end) + '\n'
            }
          }

          const methodText = member.getText(sourceFile)
          const functionText = convertMethodToFunction(methodText, isAsync)

          functions.push({
            name: member.name.text,
            fullText: functionText,
            isExported: true,
            isAsync,
            leadingComments: commentText.trim(),
            startPos: member.getStart(sourceFile),
            endPos: member.getEnd(),
          })
        }
      }
    }

    if (ts.isImportDeclaration(node)) {
      const moduleSpec = (node.moduleSpecifier as ts.StringLiteral).text
      const namedImports: string[] = []

      if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
        for (const element of node.importClause.namedBindings.elements) {
          namedImports.push(element.name.text)
        }
      }

      imports.push({
        fullText: node.getText(sourceFile),
        moduleSpecifier: moduleSpec,
        namedImports,
      })
    }

    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      types.push(node.getText(sourceFile))
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return { functions, imports, types }
}

export const astNameHelpers = { toKebabCase, toClassName }
