# Entity Prefixing for Package Database Operations

## Overview

To prevent entity name collisions between packages in the generated Prisma schema, MetaBuilder uses a standardized entity prefixing system. When schemas are generated from package YAML definitions, entity names are automatically prefixed.

## Prefix Format

| Component | Format | Example |
|-----------|--------|---------|
| Entity Name | `Pkg_{PascalPackage}_{EntityName}` | `Pkg_ForumForge_ForumPost` |
| Table Name | `{package_id}_{lowercaseentity}` | `forum_forge_forumpost` |

### Examples

| Package | Entity | Prefixed Entity | Table Mapping |
|---------|--------|-----------------|---------------|
| `forum_forge` | `ForumCategory` | `Pkg_ForumForge_ForumCategory` | `forum_forge_forumcategory` |
| `forum_forge` | `ForumThread` | `Pkg_ForumForge_ForumThread` | `forum_forge_forumthread` |
| `social_hub` | `SocialProfile` | `Pkg_SocialHub_SocialProfile` | `social_hub_socialprofile` |
| `github_tools` | `GitHubRepository` | `Pkg_GithubTools_GitHubRepository` | `github_tools_githubrepository` |

## TypeScript (Schema Generation)

The prefixing is handled automatically during schema generation by `tools/codegen/schema-registry.ts`:

```typescript
import { getPrefixedEntityName, entityToPrisma } from './schema-registry'

// Get prefixed name
const prefixed = getPrefixedEntityName('forum_forge', 'ForumPost')
// => 'Pkg_ForumForge_ForumPost'

// Generate Prisma model with prefix
const prismaModel = entityToPrisma(schemaEntity, 'forum_forge')
```

### CLI Commands

```bash
# Show prefixed entity names for a package
npx tsx tools/codegen/schema-cli.ts prefix forum_forge

# Preview generated Prisma models with prefixes
npx tsx tools/codegen/schema-cli.ts preview forum_forge
```

## Lua (Runtime Operations)

For Lua DB operations, use the shared prefix module:

### Simple Usage

```lua
local prefix = require('shared.db.prefix')

-- Package ID for entity prefixing
local PACKAGE_ID = 'forum_forge'

-- Helper function
local function entity(name)
  return prefix.getPrefixedName(PACKAGE_ID, name)
end

-- Use in DBAL calls
function M.createPost(dbal, params)
  return dbal:create(entity('ForumPost'), {
    tenantId = params.tenantId,
    content = params.content,
    -- ...
  })
end

function M.listPosts(dbal, threadId)
  return dbal:list(entity('ForumPost'), {
    where = { threadId = threadId },
  })
end
```

### Wrapper-Based Usage

For simpler code, use the wrapper that auto-prefixes all entity names:

```lua
local prefix = require('shared.db.prefix')

-- Create a wrapped DBAL instance
local db = prefix.createPackageDb(dbal, 'forum_forge')

-- All calls automatically prefix entity names
function M.createPost(params)
  return db:create('ForumPost', {  -- Automatically becomes 'Pkg_ForumForge_ForumPost'
    tenantId = params.tenantId,
    content = params.content,
  })
end
```

## Schema YAML Files

Schema YAML files in `packages/{name}/seed/schema/*.yaml` use **unprefixed** entity names. The prefixing is applied during generation:

```yaml
# packages/forum_forge/seed/schema/forum.yaml
entities:
  ForumPost:        # Unprefixed in YAML
    fields:
      id:
        type: String
        primaryKey: true
      content:
        type: String
      threadId:
        type: String
    relations:
      thread:
        kind: belongsTo
        target: ForumThread  # Also unprefixed - same-package targets auto-resolve
        foreignKey: threadId
```

When generated:
- Entity becomes `Pkg_ForumForge_ForumPost`
- Relation target becomes `Pkg_ForumForge_ForumThread`
- Table mapping is `@@map("forum_forge_forumpost")`

## Cross-Package Relations

For relations to entities in other packages, use the full prefixed name:

```yaml
# packages/social_hub/seed/schema/social.yaml
entities:
  SocialProfile:
    relations:
      user:
        kind: belongsTo
        target: User        # Core entity (no prefix)
        foreignKey: userId
```

## Implementation Files

| File | Purpose |
|------|---------|
| [tools/codegen/schema-registry.ts](../tools/codegen/schema-registry.ts) | TypeScript prefix functions |
| [tools/codegen/schema-cli.ts](../tools/codegen/schema-cli.ts) | CLI commands including `prefix` |
| [packages/shared/seed/scripts/db/prefix.lua](../packages/shared/seed/scripts/db/prefix.lua) | Lua prefix helper module |

## Benefits

1. **No Collisions**: Two packages can have entities named `Config` without conflict
2. **Clear Ownership**: Prefixed names immediately show which package owns an entity
3. **Database Isolation**: Table names are namespaced by package
4. **Simple Code**: Lua helper means package code uses simple names internally
