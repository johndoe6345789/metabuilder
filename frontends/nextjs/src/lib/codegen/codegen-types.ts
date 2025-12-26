export type CodegenRuntime = 'web' | 'cli' | 'desktop' | 'hybrid' | 'server'

export interface CodegenSpec {
  projectName: string
  packageId: string
  runtime: CodegenRuntime
  tone?: string
  brief?: string
}

export interface CodegenTemplateFile {
  path: string
  contents: string
}

export interface CodegenManifest {
  projectName: string
  packageId: string
  runtime: CodegenRuntime
  tone?: string
  brief?: string
  generatedAt: string
}

export interface CodegenProjectTemplate {
  zipName: string
  rootDir: string
  manifest: CodegenManifest
  files: CodegenTemplateFile[]
}
