import { CodegenProjectTemplate } from './codegen-types'

const sanitizeProjectName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/^-+|-+$/g, '')

const describeRuntime = (runtime: string) => {
  switch (runtime) {
    case 'cli':
      return 'Command-line interface'
    case 'desktop':
      return 'Desktop shell'
    case 'hybrid':
      return 'Web + desktop hybrid'
    case 'server':
      return 'Backend service'
    default:
      return 'Web experience'
  }
}

export const createProjectTemplate = (spec: Parameters<CodegenProjectTemplate['files']>[0] & { projectName: string } & { packageId: string } & { runtime: string }) => {
  const baseName = sanitizeProjectName(spec.projectName || 'metabuilder-starter')
  const rootDir = baseName || 'metabuilder-starter'
  const manifest = {
    projectName: spec.projectName,
    packageId: spec.packageId,
    runtime: spec.runtime,
    tone: spec.tone,
    brief: spec.brief,
    generatedAt: new Date().toISOString(),
  }
  const canonicalBrief = spec.brief ? spec.brief : 'A tiny sample scaffolding produced by Codegen Studio.'
  const files = [
    {
      path: `${rootDir}/README.md`,
      contents: `# ${spec.projectName}\n\n${canonicalBrief}\n\nRuntime: ${describeRuntime(spec.runtime)}\nPackage: ${spec.packageId}\nTone: ${spec.tone || 'adaptive'}`,
    },
    {
      path: `${rootDir}/package.json`,
      contents: JSON.stringify({
        name: rootDir,
        version: '0.0.1',
        private: true,
        type: 'module',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '16.1.1',
          react: '19.2.3',
          'react-dom': '19.2.3',
        },
      }, null, 2),
    },
    {
      path: `${rootDir}/src/app/page.tsx`,
      contents: `export default function Page() {\n  return (\n    <main style={{ minHeight: '100vh', padding: '3rem', fontFamily: 'system-ui, sans-serif' }}>\n      <h1>${spec.projectName}</h1>\n      <p>${canonicalBrief}</p>\n      <p>Runtime focus: ${describeRuntime(spec.runtime)}</p>\n      <p>Tone: ${spec.tone || 'inventive'}</p>\n    </main>\n  )\n}\n`,
    },
    {
      path: `${rootDir}/cli/README.md`,
      contents: `# CLI companion\n\nThis CLI mirrors the Codegen Studio configuration for ${spec.projectName}.\nUse it to inspect queue metadata before exporting.`,
    },
    {
      path: `${rootDir}/cli/main.cpp`,
      contents: `#include <iostream>\n#include <string>\n\nint main() {\n  std::cout << "Codegen Studio CLI" << std::endl;\n  std::cout << "Project: ${spec.projectName}" << std::endl;\n  std::cout << "Runtime: ${spec.runtime}" << std::endl;\n  std::cout << "Package: ${spec.packageId}" << std::endl;\n  std::cout << "Tone: ${spec.tone || 'adaptive'}" << std::endl;\n  std::cout << "Brief: ${canonicalBrief}" << std::endl;\n  std::cout << "Zip contains sample Next.js + CLI scaffolding." << std::endl;\n  return 0;\n}\n`,
    },
    {
      path: `${rootDir}/spec.json`,
      contents: JSON.stringify(manifest, null, 2),
    },
  ]
  return {
    zipName: `codegen-${rootDir || 'starter'}.zip`,
    rootDir,
    manifest,
    files,
  }
}
