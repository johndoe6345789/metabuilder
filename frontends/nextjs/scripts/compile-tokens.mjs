/**
 * Build-time token compiler.
 * Reads packages/global/styles/tokens.json → src/styles/core/_global-tokens.scss
 * Run automatically via "prebuild" npm script.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dir, '..', '..', '..')
const outDir = join(__dir, '..', 'src', 'styles', 'core')

function compilePkg(pkgId) {
  const tokensPath = join(repoRoot, 'packages', pkgId, 'styles', 'tokens.json')
  let tokens
  try {
    tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'))
  } catch {
    return `/* tokens.json not found for: ${pkgId} */\n`
  }

  const lines = [`/* compiled from packages/${pkgId}/styles/tokens.json */`]

  if (tokens.cssVars && Object.keys(tokens.cssVars).length) {
    lines.push(':root {')
    for (const [k, v] of Object.entries(tokens.cssVars)) {
      lines.push(`  ${k}: ${v};`)
    }
    lines.push('}')
  }

  if (tokens.cssVarsDark && Object.keys(tokens.cssVarsDark).length) {
    lines.push('[data-theme="dark"] {')
    for (const [k, v] of Object.entries(tokens.cssVarsDark)) {
      lines.push(`  ${k}: ${v};`)
    }
    lines.push('}')
  }

  return lines.join('\n') + '\n'
}

mkdirSync(outDir, { recursive: true })
const css = compilePkg('global')
const outPath = join(outDir, '_global-tokens.scss')
writeFileSync(outPath, css)
console.log(`compiled tokens → src/styles/core/_global-tokens.scss`)
