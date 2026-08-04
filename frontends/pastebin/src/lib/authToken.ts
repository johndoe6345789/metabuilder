// Thin re-export -- was a hand-rolled duplicate of exactly this module-level
// token bridge. Kept as a separate file (rather than updating every
// importer to '@metabuilder/dbal-sso/core' directly) to avoid churning the
// ~9 call sites across this app that already import from here.
export { getAuthToken, setAuthToken } from '@metabuilder/dbal-sso/core'
