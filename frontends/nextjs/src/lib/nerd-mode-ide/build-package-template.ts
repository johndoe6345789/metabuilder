import { appendExportPath } from './append-export-path'
import { createFileNode } from './create-file-node'
import { createFolderNode } from './create-folder-node'
import type { PackageTemplate, PackageTemplateConfig } from './types'

const buildManifestJson = (config: PackageTemplateConfig): string => {
  const manifest = {
    scripts: config.luaScripts.map((script) => ({
      file: script.fileName,
      name: script.fileName.replace(/\.lua$/, ''),
      category: 'package',
      description: script.description,
    })),
  }
  return JSON.stringify(manifest, null, 2)
}

const buildMetadataJson = (config: PackageTemplateConfig): string => {
  const componentIds = config.components
    .map((component) => component.id)
    .filter((id): id is string => typeof id === 'string')

  const metadata = {
    packageId: config.packageId,
    name: config.name,
    version: config.version,
    description: config.summary,
    author: config.author,
    category: config.category,
    dependencies: [],
    exports: {
      components: componentIds,
    },
  }

  return JSON.stringify(metadata, null, 2)
}

const buildCliReadme = (config: PackageTemplateConfig): string => {
  return [
    `# ${config.name} CLI`,
    '',
    'This is a starter CLI surface for powering package-aware workflows.',
    'You can wire it to the exported zip and automate deployment steps.',
  ].join('\n')
}

const buildCliCpp = (): string => {
  return [
    '#include <iostream>',
    '',
    'int main(int argc, char** argv) {',
    '  std::cout << "MetaBuilder CLI bootstrap" << std::endl;',
    '  std::cout << "Arguments: " << argc - 1 << std::endl;',
    '  return 0;',
    '}',
  ].join('\n')
}

export function buildPackageTemplate(config: PackageTemplateConfig): PackageTemplate {
  const manifestJson = buildManifestJson(config)
  const metadataJson = buildMetadataJson(config)
  const componentsJson = JSON.stringify(config.components, null, 2)
  const examplesJson = JSON.stringify(config.examples, null, 2)

  const luaFolder = createFolderNode({
    name: 'Lua',
    exportPath: 'seed/scripts',
    expanded: true,
    children: [
      createFileNode({
        name: 'manifest.json',
        content: manifestJson,
        exportPath: 'seed/scripts/manifest.json',
      }),
      ...config.luaScripts.map((script) =>
        createFileNode({
          name: script.fileName,
          content: script.code,
          exportPath: appendExportPath('seed/scripts', script.fileName),
        })
      ),
    ],
  })

  const metadataFolder = createFolderNode({
    name: 'metadata',
    exportPath: 'seed',
    expanded: true,
    children: [
      createFileNode({
        name: 'metadata.json',
        content: metadataJson,
        exportPath: 'seed/metadata.json',
      }),
      createFileNode({
        name: 'components.json',
        content: componentsJson,
        exportPath: 'seed/components.json',
      }),
    ],
  })

  const cliFolder = createFolderNode({
    name: 'cli',
    exportPath: 'static_content/cli',
    expanded: true,
    children: [
      createFileNode({
        name: 'README.md',
        content: buildCliReadme(config),
        exportPath: 'static_content/cli/README.md',
      }),
      createFileNode({
        name: 'main.cpp',
        content: buildCliCpp(),
        exportPath: 'static_content/cli/main.cpp',
      }),
    ],
  })

  const staticFolder = createFolderNode({
    name: 'static',
    exportPath: 'static_content',
    expanded: true,
    children: [
      createFileNode({
        name: 'examples.json',
        content: examplesJson,
        exportPath: 'static_content/examples.json',
      }),
      cliFolder,
    ],
  })

  const root = createFolderNode({
    name: config.rootName,
    expanded: true,
    children: [metadataFolder, luaFolder, staticFolder],
  })

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    rootName: config.rootName,
    tree: [root],
    tags: config.tags,
  }
}
