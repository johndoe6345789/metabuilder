-- github_tools/seed/scripts/db/operations.lua
-- DBAL operations for GitHub integration settings
-- @module github_tools.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- GITHUB CONNECTION OPERATIONS
---------------------------------------------------------------------------

---@class GitHubConnectionParams
---@field tenantId string
---@field userId string
---@field accessToken string Encrypted token
---@field username string
---@field avatarUrl string|nil
---@field scopes table|nil

---Save GitHub connection
---@param dbal table DBAL client instance
---@param params GitHubConnectionParams
---@return table Created/updated connection
function M.saveConnection(dbal, params)
  -- Check for existing connection
  local existing = dbal:findFirst('GitHubConnection', {
    where = { tenantId = params.tenantId, userId = params.userId },
  })
  
  if existing then
    return dbal:update('GitHubConnection', existing.id, {
      accessToken = params.accessToken,
      username = params.username,
      avatarUrl = params.avatarUrl,
      scopes = params.scopes and json.encode(params.scopes) or nil,
      updatedAt = os.time() * 1000,
    })
  end
  
  return dbal:create('GitHubConnection', {
    tenantId = params.tenantId,
    userId = params.userId,
    accessToken = params.accessToken,
    username = params.username,
    avatarUrl = params.avatarUrl,
    scopes = params.scopes and json.encode(params.scopes) or nil,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get user's GitHub connection
---@param dbal table
---@param tenantId string
---@param userId string
---@return table|nil Connection
function M.getConnection(dbal, tenantId, userId)
  return dbal:findFirst('GitHubConnection', {
    where = { tenantId = tenantId, userId = userId },
  })
end

---Delete GitHub connection
---@param dbal table
---@param tenantId string
---@param userId string
---@return boolean Success
function M.deleteConnection(dbal, tenantId, userId)
  local connection = M.getConnection(dbal, tenantId, userId)
  if connection then
    return dbal:delete('GitHubConnection', connection.id)
  end
  return false
end

---Check if user has GitHub connected
---@param dbal table
---@param tenantId string
---@param userId string
---@return boolean
function M.isConnected(dbal, tenantId, userId)
  return M.getConnection(dbal, tenantId, userId) ~= nil
end

---------------------------------------------------------------------------
-- REPOSITORY OPERATIONS
---------------------------------------------------------------------------

---@class GitHubRepoParams
---@field tenantId string
---@field connectionId string
---@field owner string
---@field name string
---@field fullName string
---@field description string|nil
---@field isPrivate boolean
---@field defaultBranch string

---Sync a repository
---@param dbal table
---@param params GitHubRepoParams
---@return table Created/updated repo
function M.syncRepository(dbal, params)
  local existing = dbal:findFirst('GitHubRepository', {
    where = { tenantId = params.tenantId, fullName = params.fullName },
  })
  
  if existing then
    return dbal:update('GitHubRepository', existing.id, {
      description = params.description,
      isPrivate = params.isPrivate,
      defaultBranch = params.defaultBranch,
      syncedAt = os.time() * 1000,
    })
  end
  
  return dbal:create('GitHubRepository', {
    tenantId = params.tenantId,
    connectionId = params.connectionId,
    owner = params.owner,
    name = params.name,
    fullName = params.fullName,
    description = params.description,
    isPrivate = params.isPrivate,
    defaultBranch = params.defaultBranch,
    createdAt = os.time() * 1000,
    syncedAt = os.time() * 1000,
  })
end

---List synced repositories
---@param dbal table
---@param connectionId string
---@return table[] Repositories
function M.listRepositories(dbal, connectionId)
  local result = dbal:list('GitHubRepository', {
    where = { connectionId = connectionId },
    orderBy = { name = 'asc' },
    take = 200,
  })
  return result.items or {}
end

---Get repository by full name
---@param dbal table
---@param tenantId string
---@param fullName string e.g., "owner/repo"
---@return table|nil Repository
function M.getRepository(dbal, tenantId, fullName)
  return dbal:findFirst('GitHubRepository', {
    where = { tenantId = tenantId, fullName = fullName },
  })
end

---Delete repository record
---@param dbal table
---@param repoId string
---@return boolean
function M.deleteRepository(dbal, repoId)
  return dbal:delete('GitHubRepository', repoId)
end

---------------------------------------------------------------------------
-- WEBHOOK OPERATIONS
---------------------------------------------------------------------------

---@class WebhookCreateParams
---@field tenantId string
---@field repositoryId string
---@field webhookId string GitHub's webhook ID
---@field events table[] Events to listen for
---@field secret string Webhook secret

---Register a webhook
---@param dbal table
---@param params WebhookCreateParams
---@return table Created webhook
function M.registerWebhook(dbal, params)
  return dbal:create('GitHubWebhook', {
    tenantId = params.tenantId,
    repositoryId = params.repositoryId,
    webhookId = params.webhookId,
    events = json.encode(params.events or {}),
    secret = params.secret,
    isActive = true,
    createdAt = os.time() * 1000,
  })
end

---Get webhook for repository
---@param dbal table
---@param repositoryId string
---@return table|nil Webhook
function M.getWebhook(dbal, repositoryId)
  return dbal:findFirst('GitHubWebhook', {
    where = { repositoryId = repositoryId, isActive = true },
  })
end

---Deactivate webhook
---@param dbal table
---@param webhookId string
function M.deactivateWebhook(dbal, webhookId)
  return dbal:update('GitHubWebhook', webhookId, {
    isActive = false,
    updatedAt = os.time() * 1000,
  })
end

---------------------------------------------------------------------------
-- WEBHOOK EVENT LOG
---------------------------------------------------------------------------

---Log a webhook event
---@param dbal table
---@param tenantId string
---@param repositoryId string
---@param event string push|pull_request|issue|etc
---@param payload table Event payload
---@param processed boolean
function M.logWebhookEvent(dbal, tenantId, repositoryId, event, payload, processed)
  return dbal:create('GitHubWebhookEvent', {
    tenantId = tenantId,
    repositoryId = repositoryId,
    event = event,
    payload = json.encode(payload),
    processed = processed,
    receivedAt = os.time() * 1000,
  })
end

---List recent webhook events
---@param dbal table
---@param repositoryId string
---@param take number|nil
---@return table[] Events
function M.listWebhookEvents(dbal, repositoryId, take)
  local result = dbal:list('GitHubWebhookEvent', {
    where = { repositoryId = repositoryId },
    orderBy = { receivedAt = 'desc' },
    take = take or 50,
  })
  return result.items or {}
end

---Mark event as processed
---@param dbal table
---@param eventId string
function M.markEventProcessed(dbal, eventId)
  return dbal:update('GitHubWebhookEvent', eventId, {
    processed = true,
    processedAt = os.time() * 1000,
  })
end

---------------------------------------------------------------------------
-- PULL REQUEST TRACKING
---------------------------------------------------------------------------

---Track a pull request
---@param dbal table
---@param tenantId string
---@param repositoryId string
---@param prNumber number
---@param title string
---@param author string
---@param status string open|closed|merged
---@param url string
function M.trackPullRequest(dbal, tenantId, repositoryId, prNumber, title, author, status, url)
  local existing = dbal:findFirst('GitHubPullRequest', {
    where = { repositoryId = repositoryId, prNumber = prNumber },
  })
  
  if existing then
    return dbal:update('GitHubPullRequest', existing.id, {
      title = title,
      status = status,
      updatedAt = os.time() * 1000,
    })
  end
  
  return dbal:create('GitHubPullRequest', {
    tenantId = tenantId,
    repositoryId = repositoryId,
    prNumber = prNumber,
    title = title,
    author = author,
    status = status,
    url = url,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---List pull requests for repository
---@param dbal table
---@param repositoryId string
---@param status string|nil Filter by status
---@param take number|nil
---@return table[] Pull requests
function M.listPullRequests(dbal, repositoryId, status, take)
  local where = { repositoryId = repositoryId }
  
  if status then
    where.status = status
  end
  
  local result = dbal:list('GitHubPullRequest', {
    where = where,
    orderBy = { updatedAt = 'desc' },
    take = take or 20,
  })
  
  return result.items or {}
end

return M
