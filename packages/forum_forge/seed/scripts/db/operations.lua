-- forum_forge/seed/scripts/db/operations.lua
-- DBAL operations for Forum entities (Category, Thread, Post)
-- @module forum_forge.db.operations

local M = {}
local json = require('json')
local prefix = require('shared.db.prefix')

-- Package ID for entity prefixing
local PACKAGE_ID = 'forum_forge'

-- Helper to get prefixed entity name
local function entity(name)
  return prefix.getPrefixedName(PACKAGE_ID, name)
end

---------------------------------------------------------------------------
-- CATEGORY OPERATIONS
---------------------------------------------------------------------------

---@class ForumCategoryCreateParams
---@field tenantId string
---@field name string
---@field slug string
---@field description string|nil
---@field icon string|nil
---@field color string|nil
---@field parentId string|nil
---@field minLevel number|nil

---Create a new forum category
---@param dbal table DBAL client instance
---@param params ForumCategoryCreateParams
---@return table Created category
function M.createCategory(dbal, params)
  -- Get next sort order
  local existing = dbal:list(entity('ForumCategory'), {
    where = { tenantId = params.tenantId },
    orderBy = { sortOrder = 'desc' },
    take = 1,
  })
  
  local maxOrder = 0
  if existing.items and #existing.items > 0 then
    maxOrder = existing.items[1].sortOrder or 0
  end
  
  return dbal:create(entity('ForumCategory'), {
    tenantId = params.tenantId,
    name = params.name,
    slug = params.slug,
    description = params.description,
    icon = params.icon,
    color = params.color,
    parentId = params.parentId,
    sortOrder = maxOrder + 1,
    minLevel = params.minLevel or 0,
    threadCount = 0,
    postCount = 0,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---List categories
---@param dbal table DBAL client instance
---@param tenantId string
---@param parentId string|nil Filter by parent (nil for root)
---@return table[] Categories
function M.listCategories(dbal, tenantId, parentId)
  local where = { tenantId = tenantId }
  if parentId then
    where.parentId = parentId
  end
  
  local result = dbal:list(entity('ForumCategory'), {
    where = where,
    orderBy = { sortOrder = 'asc' },
    take = 100,
  })
  
  return result.items or {}
end

---Update category
---@param dbal table
---@param categoryId string
---@param updates table
---@return table Updated category
function M.updateCategory(dbal, categoryId, updates)
  updates.updatedAt = os.time() * 1000
  return dbal:update(entity('ForumCategory'), categoryId, updates)
end
end

---------------------------------------------------------------------------
-- THREAD OPERATIONS
---------------------------------------------------------------------------

---@class ForumThreadCreateParams
---@field tenantId string
---@field categoryId string
---@field authorId string
---@field authorName string
---@field title string
---@field tags table|nil Array of tag strings
---@field isPinned boolean|nil
---@field isLocked boolean|nil

---Create a new thread
---@param dbal table DBAL client instance
---@param params ForumThreadCreateParams
---@return table Created thread
function M.createThread(dbal, params)
  local thread = dbal:create(entity('ForumThread'), {
    tenantId = params.tenantId,
    categoryId = params.categoryId,
    authorId = params.authorId,
    authorName = params.authorName,
    title = params.title,
    slug = M._slugify(params.title),
    tags = params.tags and json.encode(params.tags) or '[]',
    isPinned = params.isPinned or false,
    isLocked = params.isLocked or false,
    viewCount = 0,
    replyCount = 0,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
    lastPostAt = os.time() * 1000,
    lastPostAuthorId = params.authorId,
    lastPostAuthorName = params.authorName,
  })
  
  -- Increment category thread count
  local category = dbal:read(entity('ForumCategory'), params.categoryId)
  if category then
    dbal:update(entity('ForumCategory'), params.categoryId, {
      threadCount = (category.threadCount or 0) + 1,
      updatedAt = os.time() * 1000,
    })
  end
  
  return thread
end

---List threads in a category
---@param dbal table DBAL client instance
---@param categoryId string
---@param take number|nil
---@param skip number|nil
---@return table List result
function M.listThreads(dbal, categoryId, take, skip)
  return dbal:list(entity('ForumThread'), {
    where = { categoryId = categoryId },
    orderBy = { isPinned = 'desc', lastPostAt = 'desc' },
    take = take or 20,
    skip = skip or 0,
  })
end

---Get thread by ID
---@param dbal table DBAL client instance
---@param threadId string
---@param incrementView boolean|nil Increment view count
---@return table|nil Thread
function M.getThread(dbal, threadId, incrementView)
  local thread = dbal:read(entity('ForumThread'), threadId)
  
  if thread and incrementView then
    dbal:update(entity('ForumThread'), threadId, {
      viewCount = (thread.viewCount or 0) + 1,
    })
    thread.viewCount = (thread.viewCount or 0) + 1
  end
  
  return thread
end

---Update thread
---@param dbal table
---@param threadId string
---@param updates table
---@return table Updated thread
function M.updateThread(dbal, threadId, updates)
  updates.updatedAt = os.time() * 1000
  return dbal:update(entity('ForumThread'), threadId, updates)
end
end

---Pin/unpin a thread
---@param dbal table
---@param threadId string
---@param isPinned boolean
function M.pinThread(dbal, threadId, isPinned)
  return M.updateThread(dbal, threadId, { isPinned = isPinned })
end

---Lock/unlock a thread
---@param dbal table
---@param threadId string
---@param isLocked boolean
function M.lockThread(dbal, threadId, isLocked)
  return M.updateThread(dbal, threadId, { isLocked = isLocked })
end

---------------------------------------------------------------------------
-- POST OPERATIONS
---------------------------------------------------------------------------

---@class ForumPostCreateParams
---@field tenantId string
---@field threadId string
---@field authorId string
---@field authorName string
---@field content string
---@field replyToId string|nil

---Create a new post (reply)
---@param dbal table DBAL client instance
---@param params ForumPostCreateParams
---@return table Created post
function M.createPost(dbal, params)
  local thread = dbal:read(entity('ForumThread'), params.threadId)
  if not thread then
    error('Thread not found: ' .. params.threadId)
  end
  
  if thread.isLocked then
    error('Thread is locked')
  end
  
  local post = dbal:create(entity('ForumPost'), {
    tenantId = params.tenantId,
    threadId = params.threadId,
    authorId = params.authorId,
    authorName = params.authorName,
    content = params.content,
    replyToId = params.replyToId,
    isEdited = false,
    likeCount = 0,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
  
  -- Update thread stats
  dbal:update(entity('ForumThread'), params.threadId, {
    replyCount = (thread.replyCount or 0) + 1,
    lastPostAt = os.time() * 1000,
    lastPostAuthorId = params.authorId,
    lastPostAuthorName = params.authorName,
    updatedAt = os.time() * 1000,
  })
  
  -- Update category post count
  local category = dbal:read(entity('ForumCategory'), thread.categoryId)
  if category then
    dbal:update(entity('ForumCategory'), thread.categoryId, {
      postCount = (category.postCount or 0) + 1,
      updatedAt = os.time() * 1000,
    })
  end
  
  return post
end

---List posts in a thread
---@param dbal table DBAL client instance
---@param threadId string
---@param take number|nil
---@param skip number|nil
---@return table List result
function M.listPosts(dbal, threadId, take, skip)
  return dbal:list(entity('ForumPost'), {
    where = { threadId = threadId },
    orderBy = { createdAt = 'asc' },
    take = take or 50,
    skip = skip or 0,
  })
end

---Update post content
---@param dbal table
---@param postId string
---@param content string
---@return table Updated post
function M.updatePost(dbal, postId, content)
  return dbal:update(entity('ForumPost'), postId, {
    content = content,
    isEdited = true,
    editedAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Like a post
---@param dbal table
---@param postId string
---@return table Updated post
function M.likePost(dbal, postId)
  local post = dbal:read(entity('ForumPost'), postId)
  if post then
    return dbal:update(entity('ForumPost'), postId, {
      likeCount = (post.likeCount or 0) + 1,
    })
  end
  return post
end

---Delete a post (soft delete by clearing content)
---@param dbal table
---@param postId string
---@param deletedBy string Username who deleted
---@return table Updated post
function M.deletePost(dbal, postId, deletedBy)
  return dbal:update(entity('ForumPost'), postId, {
    content = '[Deleted by ' .. deletedBy .. ']',
    isEdited = true,
    editedAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end
end

---------------------------------------------------------------------------
-- UTILITY FUNCTIONS
---------------------------------------------------------------------------

---Generate a URL-safe slug from text
---@param text string
---@return string Slug
function M._slugify(text)
  local slug = text:lower()
  slug = slug:gsub('[^%w%s-]', '')
  slug = slug:gsub('%s+', '-')
  slug = slug:gsub('-+', '-')
  slug = slug:gsub('^-', ''):gsub('-$', '')
  return slug:sub(1, 100)
end

---Search threads by title
---@param dbal table
---@param tenantId string
---@param query string
---@param take number|nil
---@return table[] Matching threads
function M.searchThreads(dbal, tenantId, query, take)
  -- Basic implementation - fetch and filter
  -- TODO: Implement proper full-text search via DBAL
  local result = dbal:list(entity('ForumThread'), {
    where = { tenantId = tenantId },
    take = 1000,
  })
  
  local matches = {}
  local lowerQuery = query:lower()
  
  for _, thread in ipairs(result.items or {}) do
    if thread.title:lower():find(lowerQuery, 1, true) then
      table.insert(matches, thread)
      if #matches >= (take or 20) then
        break
      end
    end
  end
  
  return matches
end

return M
