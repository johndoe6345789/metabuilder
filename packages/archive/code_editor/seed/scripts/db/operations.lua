-- code_editor/seed/scripts/db/operations.lua
-- DBAL operations for Code Snippets and Editor Sessions
-- @module code_editor.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- CODE SNIPPET OPERATIONS
---------------------------------------------------------------------------

---@class SnippetCreateParams
---@field tenantId string
---@field userId string
---@field title string
---@field language string
---@field code string
---@field description string|nil
---@field tags table[]|nil
---@field isPublic boolean|nil

---Create a code snippet
---@param dbal table DBAL client instance
---@param params SnippetCreateParams
---@return table Created snippet
function M.createSnippet(dbal, params)
  return dbal:create('CodeSnippet', {
    tenantId = params.tenantId,
    userId = params.userId,
    title = params.title,
    language = params.language,
    code = params.code,
    description = params.description,
    tags = params.tags and json.encode(params.tags) or nil,
    isPublic = params.isPublic or false,
    version = 1,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get snippet by ID
---@param dbal table
---@param snippetId string
---@return table|nil Snippet
function M.getSnippet(dbal, snippetId)
  local snippet = dbal:read('CodeSnippet', snippetId)
  if snippet and snippet.tags then
    snippet.tags = json.decode(snippet.tags)
  end
  return snippet
end

---List user's snippets
---@param dbal table
---@param tenantId string
---@param userId string
---@param language string|nil Filter by language
---@return table[] Snippets
function M.listUserSnippets(dbal, tenantId, userId, language)
  local result = dbal:list('CodeSnippet', {
    where = { tenantId = tenantId, userId = userId },
    orderBy = { updatedAt = 'desc' },
    take = 100,
  })
  
  local snippets = result.items or {}
  
  if language then
    local filtered = {}
    for _, s in ipairs(snippets) do
      if s.language == language then
        table.insert(filtered, s)
      end
    end
    snippets = filtered
  end
  
  return snippets
end

---List public snippets
---@param dbal table
---@param tenantId string
---@param language string|nil
---@param take number|nil
---@return table[] Snippets
function M.listPublicSnippets(dbal, tenantId, language, take)
  local result = dbal:list('CodeSnippet', {
    where = { tenantId = tenantId, isPublic = true },
    orderBy = { createdAt = 'desc' },
    take = take or 50,
  })
  
  local snippets = result.items or {}
  
  if language then
    local filtered = {}
    for _, s in ipairs(snippets) do
      if s.language == language then
        table.insert(filtered, s)
      end
    end
    snippets = filtered
  end
  
  return snippets
end

---Search snippets
---@param dbal table
---@param tenantId string
---@param query string
---@param userId string|nil
---@return table[] Matching snippets
function M.searchSnippets(dbal, tenantId, query, userId)
  local where = { tenantId = tenantId }
  
  -- Get all accessible snippets
  local result = dbal:list('CodeSnippet', {
    where = where,
    take = 1000,
  })
  
  local lowerQuery = query:lower()
  local matches = {}
  
  for _, snippet in ipairs(result.items or {}) do
    -- Include if public or owned by user
    local accessible = snippet.isPublic or (userId and snippet.userId == userId)
    
    if accessible then
      local searchable = (snippet.title or ''):lower() .. ' ' ..
                        (snippet.description or ''):lower() .. ' ' ..
                        (snippet.code or ''):lower()
      
      if searchable:find(lowerQuery, 1, true) then
        table.insert(matches, snippet)
      end
    end
  end
  
  return matches
end

---Update snippet
---@param dbal table
---@param snippetId string
---@param updates table
---@return table Updated snippet
function M.updateSnippet(dbal, snippetId, updates)
  if updates.tags and type(updates.tags) == 'table' then
    updates.tags = json.encode(updates.tags)
  end
  
  -- Increment version if code changed
  if updates.code then
    local snippet = M.getSnippet(dbal, snippetId)
    if snippet then
      updates.version = (snippet.version or 1) + 1
    end
  end
  
  updates.updatedAt = os.time() * 1000
  return dbal:update('CodeSnippet', snippetId, updates)
end

---Delete snippet
---@param dbal table
---@param snippetId string
function M.deleteSnippet(dbal, snippetId)
  return dbal:delete('CodeSnippet', snippetId)
end

---------------------------------------------------------------------------
-- EDITOR SESSION OPERATIONS
---------------------------------------------------------------------------

---@class SessionCreateParams
---@field tenantId string
---@field userId string
---@field name string
---@field files table[] Open files

---Create or update editor session
---@param dbal table
---@param params SessionCreateParams
---@return table Session
function M.saveSession(dbal, params)
  local existing = dbal:findFirst('EditorSession', {
    where = { tenantId = params.tenantId, userId = params.userId, name = params.name },
  })
  
  if existing then
    return dbal:update('EditorSession', existing.id, {
      files = json.encode(params.files),
      updatedAt = os.time() * 1000,
    })
  end
  
  return dbal:create('EditorSession', {
    tenantId = params.tenantId,
    userId = params.userId,
    name = params.name,
    files = json.encode(params.files),
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get session
---@param dbal table
---@param tenantId string
---@param userId string
---@param name string
---@return table|nil Session
function M.getSession(dbal, tenantId, userId, name)
  local session = dbal:findFirst('EditorSession', {
    where = { tenantId = tenantId, userId = userId, name = name },
  })
  
  if session and session.files then
    session.files = json.decode(session.files)
  end
  
  return session
end

---List user's sessions
---@param dbal table
---@param tenantId string
---@param userId string
---@return table[] Sessions
function M.listSessions(dbal, tenantId, userId)
  local result = dbal:list('EditorSession', {
    where = { tenantId = tenantId, userId = userId },
    orderBy = { updatedAt = 'desc' },
    take = 50,
  })
  
  return result.items or {}
end

---Delete session
---@param dbal table
---@param sessionId string
function M.deleteSession(dbal, sessionId)
  return dbal:delete('EditorSession', sessionId)
end

---------------------------------------------------------------------------
-- FILE REVISION OPERATIONS
---------------------------------------------------------------------------

---Save file revision
---@param dbal table
---@param tenantId string
---@param filePath string
---@param content string
---@param userId string
---@param message string|nil
---@return table Revision
function M.saveRevision(dbal, tenantId, filePath, content, userId, message)
  return dbal:create('FileRevision', {
    tenantId = tenantId,
    filePath = filePath,
    content = content,
    userId = userId,
    message = message,
    createdAt = os.time() * 1000,
  })
end

---Get file revisions
---@param dbal table
---@param tenantId string
---@param filePath string
---@param take number|nil
---@return table[] Revisions
function M.getRevisions(dbal, tenantId, filePath, take)
  local result = dbal:list('FileRevision', {
    where = { tenantId = tenantId, filePath = filePath },
    orderBy = { createdAt = 'desc' },
    take = take or 20,
  })
  
  return result.items or {}
end

---Get specific revision
---@param dbal table
---@param revisionId string
---@return table|nil Revision
function M.getRevision(dbal, revisionId)
  return dbal:read('FileRevision', revisionId)
end

---------------------------------------------------------------------------
-- LANGUAGE CONFIG OPERATIONS
---------------------------------------------------------------------------

---Save language configuration
---@param dbal table
---@param tenantId string
---@param language string
---@param config table
function M.saveLanguageConfig(dbal, tenantId, language, config)
  local existing = dbal:findFirst('LanguageConfig', {
    where = { tenantId = tenantId, language = language },
  })
  
  if existing then
    return dbal:update('LanguageConfig', existing.id, {
      config = json.encode(config),
      updatedAt = os.time() * 1000,
    })
  end
  
  return dbal:create('LanguageConfig', {
    tenantId = tenantId,
    language = language,
    config = json.encode(config),
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get language configuration
---@param dbal table
---@param tenantId string
---@param language string
---@return table|nil Config
function M.getLanguageConfig(dbal, tenantId, language)
  local record = dbal:findFirst('LanguageConfig', {
    where = { tenantId = tenantId, language = language },
  })
  
  if record and record.config then
    return json.decode(record.config)
  end
  
  return nil
end

---List supported languages
---@param dbal table
---@param tenantId string
---@return table[] Language configs
function M.listLanguages(dbal, tenantId)
  local result = dbal:list('LanguageConfig', {
    where = { tenantId = tenantId },
    orderBy = { language = 'asc' },
    take = 100,
  })
  
  return result.items or {}
end

return M
