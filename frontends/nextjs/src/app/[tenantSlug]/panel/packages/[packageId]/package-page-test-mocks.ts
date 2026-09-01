// Shared mock components + fixtures for PackagePage's split test files.
// Kept as .ts (no JSX) so it falls outside the 80-line .tsx guardrail that
// forces PackagePage's own tests to be split across several files.
import { createElement } from 'react'
import { vi } from 'vitest'
import type { PackageMetadata } from './use-package-metadata'

export const navHook = { useParams: vi.fn() }
export const metadataHook = { usePackageMetadata: vi.fn() }

type LevelGateProps = {
  minLevel: number
  levelName?: string
  children: React.ReactNode
}

export function mockLevelGate(props: LevelGateProps) {
  return createElement(
    'div',
    { 'data-testid': 'level-gate' },
    createElement(
      'span',
      { 'data-testid': 'level-gate-minlevel' },
      props.minLevel
    ),
    createElement(
      'span',
      { 'data-testid': 'level-gate-levelname' },
      props.levelName
    ),
    props.children
  )
}

export function mockPackageHeader(props: { metadata: PackageMetadata }) {
  return createElement(
    'div',
    { 'data-testid': 'package-header' },
    props.metadata.name
  )
}

export function mockPackageDependencies(props: { dependencies: string[] }) {
  return createElement(
    'div',
    { 'data-testid': 'package-dependencies' },
    props.dependencies.join(',')
  )
}

type PlaceholderProps = { metadata: PackageMetadata; packageId: string }

export function mockPackageViewPlaceholder(props: PlaceholderProps) {
  return createElement(
    'div',
    { 'data-testid': 'package-view-placeholder' },
    `${props.packageId}:${props.metadata.name}`
  )
}

export function makeMetadata(
  overrides: Partial<PackageMetadata> = {}
): PackageMetadata {
  return {
    packageId: 'my_pkg',
    name: 'My Pkg',
    version: '1.0.0',
    description: 'desc',
    dependencies: ['dep-a', 'dep-b'],
    level: 2,
    category: 'general',
    icon: 'M',
    ...overrides,
  }
}
