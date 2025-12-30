import * as ts from 'typescript'
import { Detector, DetectionFinding, DetectorContext } from '..'

const getLocation = (sourceFile: ts.SourceFile, node: ts.Node) => {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart())

  return {
    line: line + 1,
    column: character + 1
  }
}

const getClassName = (
  node: ts.ClassDeclaration | ts.ClassExpression,
  sourceFile: ts.SourceFile
): string => {
  if (node.name) {
    return node.name.getText(sourceFile)
  }

  const parent = node.parent

  if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
    return parent.name.text
  }

  return 'anonymous'
}

const collectClasses = (context: DetectorContext): DetectionFinding[] => {
  const sourceFile = ts.createSourceFile(
    context.filePath,
    context.source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const findings: DetectionFinding[] = []

  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
      const name = getClassName(node, sourceFile)
      findings.push({
        detectorId: 'class-detector',
        name,
        message: `Class detected: ${name}`,
        location: getLocation(sourceFile, node)
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return findings
}

export const classDetector: Detector = {
  id: 'class-detector',
  description: 'Detects class declarations and expressions within a TypeScript/TSX source file.',
  detect: collectClasses
}
