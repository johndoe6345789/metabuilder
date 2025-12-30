import * as ts from 'typescript'
import { Detector, DetectionFinding, DetectorContext } from '..'

type FunctionLike =
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.ArrowFunction
  | ts.MethodDeclaration
  | ts.ConstructorDeclaration

const getLocation = (sourceFile: ts.SourceFile, node: ts.Node) => {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart())

  return {
    line: line + 1,
    column: character + 1
  }
}

const getFunctionName = (node: FunctionLike, sourceFile: ts.SourceFile): string => {
  if ('name' in node && node.name) {
    return node.name.getText(sourceFile)
  }

  const parent = node.parent

  if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
    return parent.name.text
  }

  if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) {
    return parent.name.text
  }

  return 'anonymous'
}

const collectFunctions = (context: DetectorContext): DetectionFinding[] => {
  const sourceFile = ts.createSourceFile(
    context.filePath,
    context.source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const findings: DetectionFinding[] = []

  const visit = (node: ts.Node) => {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node)
    ) {
      const name = getFunctionName(node, sourceFile)
      findings.push({
        detectorId: 'function-detector',
        name,
        message: `Function detected: ${name}`,
        location: getLocation(sourceFile, node)
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return findings
}

export const functionDetector: Detector = {
  id: 'function-detector',
  description: 'Detects functions and methods within a TypeScript/TSX source file.',
  detect: collectFunctions
}
