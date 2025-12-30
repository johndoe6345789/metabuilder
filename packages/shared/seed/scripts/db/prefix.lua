-- packages/shared/seed/scripts/db/prefix.lua
-- Entity name prefixing helpers for DBAL operations
-- Ensures package entities don't clash with each other
-- @module shared.db.prefix

local M = {}

---Convert snake_case to PascalCase
---@param str string
---@return string
function M.toPascalCase(str)
  local result = ''
  for word in string.gmatch(str, '[^_]+') do
    result = result .. word:sub(1, 1):upper() .. word:sub(2):lower()
  end
  return result
end

---Generate prefixed entity name
---Format: Pkg_{PascalPackageName}_{EntityName}
---@param packageId string Package identifier (e.g., 'forum_forge')
---@param entityName string Original entity name (e.g., 'Post')
---@return string Prefixed name (e.g., 'Pkg_ForumForge_Post')
function M.getPrefixedName(packageId, entityName)
  local prefix = M.toPascalCase(packageId)
  return 'Pkg_' .. prefix .. '_' .. entityName
end

---Get table name from package and entity
---Format: {packageId}_{lowercaseEntityName}
---@param packageId string
---@param entityName string
---@return string Table name
function M.getTableName(packageId, entityName)
  return packageId .. '_' .. entityName:lower()
end

---Check if an entity name is prefixed
---@param name string
---@return boolean
function M.isPrefixed(name)
  return name:sub(1, 4) == 'Pkg_'
end

---Extract package ID from prefixed entity name
---@param prefixedName string e.g., 'Pkg_ForumForge_Post'
---@return string|nil Package ID (e.g., 'forum_forge')
function M.extractPackage(prefixedName)
  if not M.isPrefixed(prefixedName) then
    return nil
  end
  
  local match = prefixedName:match('^Pkg_([A-Z][a-zA-Z]*)_')
  if not match then
    return nil
  end
  
  -- Convert PascalCase back to snake_case
  local result = match:gsub('([a-z])([A-Z])', '%1_%2'):lower()
  return result
end

---Extract original entity name from prefixed name
---@param prefixedName string e.g., 'Pkg_ForumForge_Post'
---@return string|nil Entity name (e.g., 'Post')
function M.extractEntity(prefixedName)
  if not M.isPrefixed(prefixedName) then
    return nil
  end
  
  -- Find the position after the second underscore
  local count = 0
  local pos = 0
  for i = 1, #prefixedName do
    if prefixedName:sub(i, i) == '_' then
      count = count + 1
      if count == 2 then
        pos = i
        break
      end
    end
  end
  
  if pos == 0 then
    return nil
  end
  
  return prefixedName:sub(pos + 1)
end

---Create a package-aware DBAL wrapper
---All entity names are automatically prefixed
---@param dbal table DBAL client instance
---@param packageId string Package identifier
---@return table Wrapped DBAL with auto-prefixing
function M.createPackageDb(dbal, packageId)
  local wrapper = {}
  
  -- Wrap all DBAL methods to auto-prefix entity names
  function wrapper:create(entity, data)
    return dbal:create(M.getPrefixedName(packageId, entity), data)
  end
  
  function wrapper:read(entity, id)
    return dbal:read(M.getPrefixedName(packageId, entity), id)
  end
  
  function wrapper:update(entity, id, data)
    return dbal:update(M.getPrefixedName(packageId, entity), id, data)
  end
  
  function wrapper:delete(entity, id)
    return dbal:delete(M.getPrefixedName(packageId, entity), id)
  end
  
  function wrapper:list(entity, options)
    return dbal:list(M.getPrefixedName(packageId, entity), options)
  end
  
  function wrapper:findFirst(entity, options)
    return dbal:findFirst(M.getPrefixedName(packageId, entity), options)
  end
  
  -- Allow access to raw DBAL for cross-package queries
  wrapper.raw = dbal
  wrapper.packageId = packageId
  
  return wrapper
end

return M
