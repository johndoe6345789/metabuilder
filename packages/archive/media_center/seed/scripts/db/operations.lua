-- media_center/seed/scripts/db/operations.lua
-- DBAL operations for MediaAsset and MediaJob entities
-- @module media_center.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- MEDIA ASSET OPERATIONS
---------------------------------------------------------------------------

---@class MediaAssetCreateParams
---@field tenantId string
---@field userId string
---@field filename string
---@field originalName string
---@field mimeType string
---@field size number
---@field path string
---@field thumbnailPath string|nil
---@field width number|nil
---@field height number|nil
---@field duration number|nil
---@field metadata table|nil

---Create a new media asset
---@param dbal table DBAL client instance
---@param params MediaAssetCreateParams
---@return table Created asset
function M.createAsset(dbal, params)
  return dbal:create('MediaAsset', {
    tenantId = params.tenantId,
    userId = params.userId,
    filename = params.filename,
    originalName = params.originalName,
    mimeType = params.mimeType,
    size = params.size,
    path = params.path,
    thumbnailPath = params.thumbnailPath,
    width = params.width,
    height = params.height,
    duration = params.duration,
    metadata = params.metadata and json.encode(params.metadata) or nil,
    createdAt = os.time() * 1000,
  })
end

---Get asset by ID
---@param dbal table
---@param assetId string
---@return table|nil Asset
function M.getAsset(dbal, assetId)
  return dbal:read('MediaAsset', assetId)
end

---List assets for a user
---@param dbal table
---@param tenantId string
---@param userId string|nil Filter by user
---@param mimeType string|nil Filter by mime type prefix (e.g., "image/", "video/")
---@param take number|nil
---@param skip number|nil
---@return table List result
function M.listAssets(dbal, tenantId, userId, mimeType, take, skip)
  local where = { tenantId = tenantId }
  
  if userId then
    where.userId = userId
  end
  
  local result = dbal:list('MediaAsset', {
    where = where,
    orderBy = { createdAt = 'desc' },
    take = take or 50,
    skip = skip or 0,
  })
  
  -- Filter by mimeType prefix if specified
  if mimeType and result.items then
    local filtered = {}
    for _, asset in ipairs(result.items) do
      if asset.mimeType and asset.mimeType:sub(1, #mimeType) == mimeType then
        table.insert(filtered, asset)
      end
    end
    result.items = filtered
  end
  
  return result
end

---List images only
---@param dbal table
---@param tenantId string
---@param userId string|nil
---@param take number|nil
---@return table List result
function M.listImages(dbal, tenantId, userId, take)
  return M.listAssets(dbal, tenantId, userId, 'image/', take, 0)
end

---List videos only
---@param dbal table
---@param tenantId string
---@param userId string|nil
---@param take number|nil
---@return table List result
function M.listVideos(dbal, tenantId, userId, take)
  return M.listAssets(dbal, tenantId, userId, 'video/', take, 0)
end

---List audio only
---@param dbal table
---@param tenantId string
---@param userId string|nil
---@param take number|nil
---@return table List result
function M.listAudio(dbal, tenantId, userId, take)
  return M.listAssets(dbal, tenantId, userId, 'audio/', take, 0)
end

---Update asset metadata
---@param dbal table
---@param assetId string
---@param metadata table
---@return table Updated asset
function M.updateMetadata(dbal, assetId, metadata)
  return dbal:update('MediaAsset', assetId, {
    metadata = json.encode(metadata),
  })
end

---Delete asset
---@param dbal table
---@param assetId string
---@return boolean Success
function M.deleteAsset(dbal, assetId)
  return dbal:delete('MediaAsset', assetId)
end

---Get storage usage for a user
---@param dbal table
---@param tenantId string
---@param userId string
---@return number Total size in bytes
function M.getUserStorageUsage(dbal, tenantId, userId)
  local result = M.listAssets(dbal, tenantId, userId, nil, 10000, 0)
  local total = 0
  
  for _, asset in ipairs(result.items or {}) do
    total = total + (asset.size or 0)
  end
  
  return total
end

---------------------------------------------------------------------------
-- MEDIA JOB OPERATIONS
---------------------------------------------------------------------------

---@class MediaJobCreateParams
---@field tenantId string
---@field assetId string
---@field type string transcode|thumbnail|resize|optimize|analyze
---@field priority number|nil
---@field inputPath string
---@field outputPath string|nil
---@field config table|nil

---Create a new media job
---@param dbal table
---@param params MediaJobCreateParams
---@return table Created job
function M.createJob(dbal, params)
  return dbal:create('MediaJob', {
    tenantId = params.tenantId,
    assetId = params.assetId,
    type = params.type,
    status = 'pending',
    priority = params.priority or 5,
    progress = 0,
    inputPath = params.inputPath,
    outputPath = params.outputPath,
    config = params.config and json.encode(params.config) or nil,
    createdAt = os.time() * 1000,
  })
end

---Get job by ID
---@param dbal table
---@param jobId string
---@return table|nil Job
function M.getJob(dbal, jobId)
  return dbal:read('MediaJob', jobId)
end

---List pending jobs
---@param dbal table
---@param tenantId string
---@param take number|nil
---@return table[] Jobs
function M.listPendingJobs(dbal, tenantId, take)
  local result = dbal:list('MediaJob', {
    where = { tenantId = tenantId, status = 'pending' },
    orderBy = { priority = 'desc', createdAt = 'asc' },
    take = take or 20,
  })
  return result.items or {}
end

---Start a job (mark as processing)
---@param dbal table
---@param jobId string
---@param workerId string|nil
---@return table Updated job
function M.startJob(dbal, jobId, workerId)
  return dbal:update('MediaJob', jobId, {
    status = 'processing',
    startedAt = os.time() * 1000,
    workerId = workerId,
  })
end

---Update job progress
---@param dbal table
---@param jobId string
---@param progress number 0-100
---@return table Updated job
function M.updateProgress(dbal, jobId, progress)
  return dbal:update('MediaJob', jobId, {
    progress = progress,
  })
end

---Complete a job
---@param dbal table
---@param jobId string
---@param outputPath string
---@param result table|nil
---@return table Updated job
function M.completeJob(dbal, jobId, outputPath, result)
  return dbal:update('MediaJob', jobId, {
    status = 'completed',
    progress = 100,
    outputPath = outputPath,
    result = result and json.encode(result) or nil,
    completedAt = os.time() * 1000,
  })
end

---Fail a job
---@param dbal table
---@param jobId string
---@param error string
---@return table Updated job
function M.failJob(dbal, jobId, error)
  return dbal:update('MediaJob', jobId, {
    status = 'failed',
    error = error,
    completedAt = os.time() * 1000,
  })
end

---Cancel a job
---@param dbal table
---@param jobId string
---@return table Updated job
function M.cancelJob(dbal, jobId)
  return dbal:update('MediaJob', jobId, {
    status = 'cancelled',
    completedAt = os.time() * 1000,
  })
end

---Queue a thumbnail generation job
---@param dbal table
---@param tenantId string
---@param assetId string
---@param inputPath string
---@param outputPath string
---@param options table|nil width, height, format
---@return table Created job
function M.queueThumbnail(dbal, tenantId, assetId, inputPath, outputPath, options)
  return M.createJob(dbal, {
    tenantId = tenantId,
    assetId = assetId,
    type = 'thumbnail',
    priority = 7,
    inputPath = inputPath,
    outputPath = outputPath,
    config = options or { width = 256, height = 256, format = 'webp' },
  })
end

---Queue a transcode job
---@param dbal table
---@param tenantId string
---@param assetId string
---@param inputPath string
---@param outputPath string
---@param options table format, codec, quality, etc.
---@return table Created job
function M.queueTranscode(dbal, tenantId, assetId, inputPath, outputPath, options)
  return M.createJob(dbal, {
    tenantId = tenantId,
    assetId = assetId,
    type = 'transcode',
    priority = 5,
    inputPath = inputPath,
    outputPath = outputPath,
    config = options,
  })
end

return M
