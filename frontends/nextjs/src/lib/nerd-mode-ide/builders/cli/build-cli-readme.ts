import type { PackageTemplateConfig } from './types'

export function buildCliReadme(config: PackageTemplateConfig): string {
  return [
    `# ${config.name} CLI`,
    '',
    'This is a starter CLI surface for powering package-aware workflows.',
    'You can wire it to the exported zip and automate deployment steps.',
  ].join('\n')
}
