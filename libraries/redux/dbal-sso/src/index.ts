// Framework-agnostic core -- usable with or without Redux. Consumers with
// no Redux (e.g. the `dbal` admin console) should import from
// '@metabuilder/dbal-sso/core' instead of this root entry point, so
// react-redux/@reduxjs-toolkit never need to be resolvable at all -- see
// core/index.ts and package.json's `exports` map.
export * from './core'

// Optional Redux adapter -- re-exported from the same entry point since
// react-redux/@reduxjs-toolkit are peerDependenciesMeta-optional, not
// required just to import the core.
export { createDbalSsoSlice } from './redux'
export type { DbalSsoState, DbalSsoSlice } from './redux'
