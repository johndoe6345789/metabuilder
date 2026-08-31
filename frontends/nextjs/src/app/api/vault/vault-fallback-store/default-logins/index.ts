import { DEFAULT_GROUP_LOGINS } from './default-group'
import { TESTING_GROUP_LOGINS } from './testing-group'
import { WORKSPACE_GROUP_LOGINS } from './workspace-group'
import { ADMINISTRATION_GROUP_LOGINS } from './administration-group'
import { SYSTEM_GROUP_LOGINS } from './system-group'

/** Seed logins for the local vault fallback -- smoke-test accounts only,
 *  used when DBAL is unreachable. Grouped to mirror the Default/Public/
 *  Testing/Workspace/Administration/System `group` field each carries. */
export const DEFAULT_VAULT_LOGINS = [
  ...DEFAULT_GROUP_LOGINS,
  ...TESTING_GROUP_LOGINS,
  ...WORKSPACE_GROUP_LOGINS,
  ...ADMINISTRATION_GROUP_LOGINS,
  ...SYSTEM_GROUP_LOGINS,
]
