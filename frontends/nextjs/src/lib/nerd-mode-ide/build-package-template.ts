import { appendExportPath } from './append-export-path'
import { buildCliCpp } from './build-cli-cpp'
import { buildCliReadme } from './build-cli-readme'
import { buildPackageManifestJson } from './build-package-manifest-json'
import { buildPackageMetadataJson } from './build-package-metadata-json'
import { createFileNode } from './create-file-node'
import { createFolderNode } from './create-folder-node'
import type { PackageTemplate, PackageTemplateConfig } from './types'

export function buildPackageTemplate(config: PackageTemplateConfig): PackageTemplate {
  const manifestJson = buildPackageManifestJson(config)
  const metadataJson = buildPackageMetadataJson(config)
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
