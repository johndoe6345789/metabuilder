import { createDbalSsoSlice } from '@metabuilder/dbal-sso'
import { dbalSsoConfig } from '@/lib/dbalSsoConfig'

// codegen has no pre-existing auth of its own (unlike pastebin, which also
// has a native Flask password login to preserve) -- a direct, unmodified
// use of the shared package's slice factory.
const dbalAuth = createDbalSsoSlice(dbalSsoConfig)

export const { logout, clearError, seedToken, tokensRefreshed } = dbalAuth.actions
export const { startOidcLogin, completeOidcLogin } = dbalAuth.thunks
export default dbalAuth.reducer
