/**
 * Module declarations for custom replacements
 * These override external packages with our own implementations
 */

// Replace Spark hooks with our custom implementation
declare module '@github/spark/hooks' {
  export { useKV } from '@metabuilder/hooks'
}
