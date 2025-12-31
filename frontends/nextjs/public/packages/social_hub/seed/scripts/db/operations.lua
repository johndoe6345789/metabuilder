-- social_hub/seed/scripts/db/operations.lua
-- DBAL operations for Social features (profiles, connections, activity)
-- @module social_hub.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- SOCIAL PROFILE OPERATIONS
---------------------------------------------------------------------------

---@class ProfileParams
---@field tenantId string
---@field userId string
---@field displayName string
---@field bio string|nil
---@field avatar string|nil
---@field links table|nil Social links
---@field settings table|nil Privacy settings

---Create or update social profile
---@param dbal table DBAL client instance
---@param params ProfileParams
---@return table Profile
function M.saveProfile(dbal, params)
  local existing = dbal:findFirst('SocialProfile', {
    where = { tenantId = params.tenantId, userId = params.userId },
  })
  
  local data = {
    displayName = params.displayName,
    bio = params.bio,
    avatar = params.avatar,
    links = params.links and json.encode(params.links) or nil,
    settings = params.settings and json.encode(params.settings) or nil,
    updatedAt = os.time() * 1000,
  }
  
  if existing then
    return dbal:update('SocialProfile', existing.id, data)
  end
  
  data.tenantId = params.tenantId
  data.userId = params.userId
  data.createdAt = os.time() * 1000
  return dbal:create('SocialProfile', data)
end

---Get profile by user ID
---@param dbal table
---@param tenantId string
---@param userId string
---@return table|nil Profile
function M.getProfile(dbal, tenantId, userId)
  local profile = dbal:findFirst('SocialProfile', {
    where = { tenantId = tenantId, userId = userId },
  })
  
  if profile then
    if profile.links then profile.links = json.decode(profile.links) end
    if profile.settings then profile.settings = json.decode(profile.settings) end
  end
  
  return profile
end

---Search profiles
---@param dbal table
---@param tenantId string
---@param query string
---@param take number|nil
---@return table[] Profiles
function M.searchProfiles(dbal, tenantId, query, take)
  local result = dbal:list('SocialProfile', {
    where = { tenantId = tenantId },
    take = 1000,
  })
  
  local lowerQuery = query:lower()
  local matches = {}
  
  for _, profile in ipairs(result.items or {}) do
    local searchable = (profile.displayName or ''):lower() .. ' ' .. (profile.bio or ''):lower()
    if searchable:find(lowerQuery, 1, true) then
      table.insert(matches, profile)
      if #matches >= (take or 20) then
        break
      end
    end
  end
  
  return matches
end

---------------------------------------------------------------------------
-- CONNECTION OPERATIONS (Following/Followers)
---------------------------------------------------------------------------

---Follow a user
---@param dbal table
---@param tenantId string
---@param followerId string User doing the following
---@param followingId string User being followed
---@return table Connection
function M.follow(dbal, tenantId, followerId, followingId)
  -- Check if already following
  local existing = dbal:findFirst('SocialConnection', {
    where = { tenantId = tenantId, followerId = followerId, followingId = followingId },
  })
  
  if existing then
    return existing
  end
  
  return dbal:create('SocialConnection', {
    tenantId = tenantId,
    followerId = followerId,
    followingId = followingId,
    createdAt = os.time() * 1000,
  })
end

---Unfollow a user
---@param dbal table
---@param tenantId string
---@param followerId string
---@param followingId string
function M.unfollow(dbal, tenantId, followerId, followingId)
  local connection = dbal:findFirst('SocialConnection', {
    where = { tenantId = tenantId, followerId = followerId, followingId = followingId },
  })
  
  if connection then
    dbal:delete('SocialConnection', connection.id)
  end
end

---Check if following
---@param dbal table
---@param tenantId string
---@param followerId string
---@param followingId string
---@return boolean
function M.isFollowing(dbal, tenantId, followerId, followingId)
  local connection = dbal:findFirst('SocialConnection', {
    where = { tenantId = tenantId, followerId = followerId, followingId = followingId },
  })
  return connection ~= nil
end

---Get followers
---@param dbal table
---@param tenantId string
---@param userId string
---@param take number|nil
---@return table[] Follower user IDs
function M.getFollowers(dbal, tenantId, userId, take)
  local result = dbal:list('SocialConnection', {
    where = { tenantId = tenantId, followingId = userId },
    orderBy = { createdAt = 'desc' },
    take = take or 50,
  })
  
  local followers = {}
  for _, conn in ipairs(result.items or {}) do
    table.insert(followers, conn.followerId)
  end
  
  return followers
end

---Get following
---@param dbal table
---@param tenantId string
---@param userId string
---@param take number|nil
---@return table[] Following user IDs
function M.getFollowing(dbal, tenantId, userId, take)
  local result = dbal:list('SocialConnection', {
    where = { tenantId = tenantId, followerId = userId },
    orderBy = { createdAt = 'desc' },
    take = take or 50,
  })
  
  local following = {}
  for _, conn in ipairs(result.items or {}) do
    table.insert(following, conn.followingId)
  end
  
  return following
end

---Get follower/following counts
---@param dbal table
---@param tenantId string
---@param userId string
---@return table Counts
function M.getConnectionCounts(dbal, tenantId, userId)
  local followers = dbal:list('SocialConnection', {
    where = { tenantId = tenantId, followingId = userId },
    take = 100000,
  })
  
  local following = dbal:list('SocialConnection', {
    where = { tenantId = tenantId, followerId = userId },
    take = 100000,
  })
  
  return {
    followers = followers.total or #(followers.items or {}),
    following = following.total or #(following.items or {}),
  }
end

---------------------------------------------------------------------------
-- ACTIVITY FEED OPERATIONS
---------------------------------------------------------------------------

---@class ActivityParams
---@field tenantId string
---@field userId string
---@field type string (post, like, comment, follow, etc.)
---@field content string|nil
---@field targetId string|nil Reference to target object
---@field targetType string|nil Type of target
---@field metadata table|nil

---Create activity
---@param dbal table
---@param params ActivityParams
---@return table Activity
function M.createActivity(dbal, params)
  return dbal:create('SocialActivity', {
    tenantId = params.tenantId,
    userId = params.userId,
    type = params.type,
    content = params.content,
    targetId = params.targetId,
    targetType = params.targetType,
    metadata = params.metadata and json.encode(params.metadata) or nil,
    createdAt = os.time() * 1000,
  })
end

---Get user's activity feed
---@param dbal table
---@param tenantId string
---@param userId string
---@param take number|nil
---@param skip number|nil
---@return table[] Activities
function M.getUserActivity(dbal, tenantId, userId, take, skip)
  local result = dbal:list('SocialActivity', {
    where = { tenantId = tenantId, userId = userId },
    orderBy = { createdAt = 'desc' },
    take = take or 20,
    skip = skip or 0,
  })
  
  local activities = result.items or {}
  for _, activity in ipairs(activities) do
    if activity.metadata then
      activity.metadata = json.decode(activity.metadata)
    end
  end
  
  return activities
end

---Get home feed (activity from followed users)
---@param dbal table
---@param tenantId string
---@param userId string
---@param take number|nil
---@param skip number|nil
---@return table[] Activities
function M.getHomeFeed(dbal, tenantId, userId, take, skip)
  -- Get list of users being followed
  local following = M.getFollowing(dbal, tenantId, userId, 1000)
  
  -- Include own activity
  table.insert(following, userId)
  
  -- Get all activities (would be better with IN query support)
  local result = dbal:list('SocialActivity', {
    where = { tenantId = tenantId },
    orderBy = { createdAt = 'desc' },
    take = 1000,
  })
  
  -- Filter to followed users
  local followingSet = {}
  for _, id in ipairs(following) do
    followingSet[id] = true
  end
  
  local feed = {}
  local skipped = 0
  
  for _, activity in ipairs(result.items or {}) do
    if followingSet[activity.userId] then
      if skipped >= (skip or 0) then
        if activity.metadata then
          activity.metadata = json.decode(activity.metadata)
        end
        table.insert(feed, activity)
        if #feed >= (take or 20) then
          break
        end
      else
        skipped = skipped + 1
      end
    end
  end
  
  return feed
end

---------------------------------------------------------------------------
-- LIKES OPERATIONS
---------------------------------------------------------------------------

---Like something
---@param dbal table
---@param tenantId string
---@param userId string
---@param targetId string
---@param targetType string
---@return table Like
function M.like(dbal, tenantId, userId, targetId, targetType)
  local existing = dbal:findFirst('SocialLike', {
    where = { tenantId = tenantId, userId = userId, targetId = targetId },
  })
  
  if existing then
    return existing
  end
  
  -- Create activity
  M.createActivity(dbal, {
    tenantId = tenantId,
    userId = userId,
    type = 'like',
    targetId = targetId,
    targetType = targetType,
  })
  
  return dbal:create('SocialLike', {
    tenantId = tenantId,
    userId = userId,
    targetId = targetId,
    targetType = targetType,
    createdAt = os.time() * 1000,
  })
end

---Unlike something
---@param dbal table
---@param tenantId string
---@param userId string
---@param targetId string
function M.unlike(dbal, tenantId, userId, targetId)
  local like = dbal:findFirst('SocialLike', {
    where = { tenantId = tenantId, userId = userId, targetId = targetId },
  })
  
  if like then
    dbal:delete('SocialLike', like.id)
  end
end

---Check if liked
---@param dbal table
---@param tenantId string
---@param userId string
---@param targetId string
---@return boolean
function M.hasLiked(dbal, tenantId, userId, targetId)
  local like = dbal:findFirst('SocialLike', {
    where = { tenantId = tenantId, userId = userId, targetId = targetId },
  })
  return like ~= nil
end

---Get like count
---@param dbal table
---@param tenantId string
---@param targetId string
---@return number
function M.getLikeCount(dbal, tenantId, targetId)
  local result = dbal:list('SocialLike', {
    where = { tenantId = tenantId, targetId = targetId },
    take = 100000,
  })
  return result.total or #(result.items or {})
end

return M
