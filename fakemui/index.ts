/**
 * FakeMUI - Material Design 3 Component Library
 *
 * This package re-exports components from @metabuilder/components/fakemui
 * and provides SCSS/styling utilities.
 *
 * Components have been moved to the root components/ folder:
 *   - React components: components/fakemui/
 *   - QML components: qml/
 *   - Python bindings: python/fakemui/
 *
 * This file maintains backward compatibility for existing imports:
 *   import { Button, Card } from '@metabuilder/fakemui'
 */

// Re-export all components from the new location
export * from '../components/fakemui'

// Local utilities (SCSS-related)
export * from './src/utils'

// Hooks
export * from './hooks'
