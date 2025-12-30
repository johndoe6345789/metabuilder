import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

export function getFunctionExtension() {
    return '.cpp'
  }
