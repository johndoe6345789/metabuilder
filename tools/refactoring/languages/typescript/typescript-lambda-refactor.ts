import { DependencyInfo, FunctionInfo, RefactorResult } from '../types'
import { extractTypeScriptDependencies } from './extract-dependencies'
import { extractTypeScriptFunctions } from './extract-functions'
import { generateTypeScriptFunctionFile } from './generate-function-file'
import { generateTypeScriptModule } from './generate-module'

export class TypeScriptLambdaRefactor {
  constructor(private readonly options: { dryRun: boolean; log: (message: string) => void }) {}

  getFunctionExtension() {
    return '.ts'
  }

  async extractFunctions(filePath: string): Promise<FunctionInfo[]> {
    return extractTypeScriptFunctions(filePath)
  }

  async extractDependencies(filePath: string): Promise<DependencyInfo> {
    return extractTypeScriptDependencies(filePath)
  }

  generateFunctionFile(func: FunctionInfo, imports: string[]): string {
    return generateTypeScriptFunctionFile(func, imports)
  }

  async generateModule(filePath: string): Promise<RefactorResult> {
    return generateTypeScriptModule(filePath, this.options)
  }
}
