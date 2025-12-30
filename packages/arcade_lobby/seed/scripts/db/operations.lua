-- arcade_lobby/seed/scripts/db/operations.lua
-- DBAL operations for Game and Leaderboard entities
-- @module arcade_lobby.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- GAME OPERATIONS
---------------------------------------------------------------------------

---@class GameCreateParams
---@field tenantId string
---@field name string
---@field slug string
---@field description string|nil
---@field thumbnail string|nil
---@field category string
---@field minPlayers number
---@field maxPlayers number
---@field config table|nil Game configuration

---Create a new game entry
---@param dbal table DBAL client instance
---@param params GameCreateParams
---@return table Created game
function M.createGame(dbal, params)
  return dbal:create('Game', {
    tenantId = params.tenantId,
    name = params.name,
    slug = params.slug or M._slugify(params.name),
    description = params.description,
    thumbnail = params.thumbnail,
    category = params.category,
    minPlayers = params.minPlayers or 1,
    maxPlayers = params.maxPlayers or 1,
    config = params.config and json.encode(params.config) or '{}',
    isActive = true,
    playCount = 0,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get game by ID
---@param dbal table
---@param gameId string
---@return table|nil Game
function M.getGame(dbal, gameId)
  local game = dbal:read('Game', gameId)
  if game and game.config then
    game.config = json.decode(game.config)
  end
  return game
end

---Get game by slug
---@param dbal table
---@param tenantId string
---@param slug string
---@return table|nil Game
function M.getGameBySlug(dbal, tenantId, slug)
  local game = dbal:findFirst('Game', {
    where = { tenantId = tenantId, slug = slug },
  })
  if game and game.config then
    game.config = json.decode(game.config)
  end
  return game
end

---List all games
---@param dbal table
---@param tenantId string
---@param category string|nil Filter by category
---@param take number|nil
---@return table[] Games
function M.listGames(dbal, tenantId, category, take)
  local where = { tenantId = tenantId, isActive = true }
  
  local result = dbal:list('Game', {
    where = where,
    orderBy = { playCount = 'desc' },
    take = take or 50,
  })
  
  local games = result.items or {}
  
  -- Filter by category if specified
  if category then
    local filtered = {}
    for _, game in ipairs(games) do
      if game.category == category then
        table.insert(filtered, game)
      end
    end
    games = filtered
  end
  
  return games
end

---Increment play count
---@param dbal table
---@param gameId string
function M.incrementPlayCount(dbal, gameId)
  local game = M.getGame(dbal, gameId)
  if game then
    dbal:update('Game', gameId, {
      playCount = (game.playCount or 0) + 1,
    })
  end
end

---Update game
---@param dbal table
---@param gameId string
---@param updates table
---@return table Updated game
function M.updateGame(dbal, gameId, updates)
  if updates.config and type(updates.config) == 'table' then
    updates.config = json.encode(updates.config)
  end
  updates.updatedAt = os.time() * 1000
  return dbal:update('Game', gameId, updates)
end

---Deactivate game
---@param dbal table
---@param gameId string
function M.deactivateGame(dbal, gameId)
  return M.updateGame(dbal, gameId, { isActive = false })
end

---------------------------------------------------------------------------
-- LEADERBOARD OPERATIONS
---------------------------------------------------------------------------

---@class LeaderboardEntryParams
---@field tenantId string
---@field gameId string
---@field userId string
---@field username string
---@field score number
---@field metadata table|nil Additional game-specific data

---Submit a score
---@param dbal table
---@param params LeaderboardEntryParams
---@return table Created entry
function M.submitScore(dbal, params)
  return dbal:create('LeaderboardEntry', {
    tenantId = params.tenantId,
    gameId = params.gameId,
    userId = params.userId,
    username = params.username,
    score = params.score,
    metadata = params.metadata and json.encode(params.metadata) or nil,
    submittedAt = os.time() * 1000,
  })
end

---Get high scores for a game
---@param dbal table
---@param gameId string
---@param take number|nil
---@return table[] Sorted entries
function M.getHighScores(dbal, gameId, take)
  local result = dbal:list('LeaderboardEntry', {
    where = { gameId = gameId },
    orderBy = { score = 'desc' },
    take = take or 10,
  })
  return result.items or {}
end

---Get user's best score for a game
---@param dbal table
---@param gameId string
---@param userId string
---@return table|nil Best entry
function M.getUserBestScore(dbal, gameId, userId)
  local result = dbal:list('LeaderboardEntry', {
    where = { gameId = gameId, userId = userId },
    orderBy = { score = 'desc' },
    take = 1,
  })
  
  if result.items and #result.items > 0 then
    return result.items[1]
  end
  return nil
end

---Get user's rank on leaderboard
---@param dbal table
---@param gameId string
---@param userId string
---@return number|nil Rank (1-based) or nil if no score
function M.getUserRank(dbal, gameId, userId)
  local userBest = M.getUserBestScore(dbal, gameId, userId)
  if not userBest then
    return nil
  end
  
  local allScores = M.getHighScores(dbal, gameId, 10000)
  
  for rank, entry in ipairs(allScores) do
    if entry.userId == userId then
      return rank
    end
  end
  
  return nil
end

---Get leaderboard with user's position highlighted
---@param dbal table
---@param gameId string
---@param userId string
---@param around number|nil How many entries to show around user
---@return table Leaderboard data
function M.getLeaderboardWithUser(dbal, gameId, userId, around)
  around = around or 3
  local topScores = M.getHighScores(dbal, gameId, 10)
  local userRank = M.getUserRank(dbal, gameId, userId)
  
  return {
    top = topScores,
    userRank = userRank,
    userBest = M.getUserBestScore(dbal, gameId, userId),
  }
end

---------------------------------------------------------------------------
-- GAME SESSION OPERATIONS
---------------------------------------------------------------------------

---@class GameSessionParams
---@field tenantId string
---@field gameId string
---@field hostId string
---@field maxPlayers number

---Create a game session (multiplayer lobby)
---@param dbal table
---@param params GameSessionParams
---@return table Created session
function M.createSession(dbal, params)
  return dbal:create('GameSession', {
    tenantId = params.tenantId,
    gameId = params.gameId,
    hostId = params.hostId,
    status = 'waiting',
    maxPlayers = params.maxPlayers,
    currentPlayers = 1,
    players = json.encode({ params.hostId }),
    createdAt = os.time() * 1000,
  })
end

---Get session by ID
---@param dbal table
---@param sessionId string
---@return table|nil Session
function M.getSession(dbal, sessionId)
  local session = dbal:read('GameSession', sessionId)
  if session and session.players then
    session.players = json.decode(session.players)
  end
  return session
end

---List active sessions for a game
---@param dbal table
---@param gameId string
---@return table[] Sessions
function M.listActiveSessions(dbal, gameId)
  local result = dbal:list('GameSession', {
    where = { gameId = gameId, status = 'waiting' },
    orderBy = { createdAt = 'desc' },
    take = 20,
  })
  
  local sessions = result.items or {}
  for _, session in ipairs(sessions) do
    if session.players then
      session.players = json.decode(session.players)
    end
  end
  
  return sessions
end

---Join a session
---@param dbal table
---@param sessionId string
---@param userId string
---@return table|nil Updated session or nil if full
function M.joinSession(dbal, sessionId, userId)
  local session = M.getSession(dbal, sessionId)
  if not session then
    error('Session not found: ' .. sessionId)
  end
  
  if session.currentPlayers >= session.maxPlayers then
    return nil -- Session full
  end
  
  local players = session.players or {}
  
  -- Check if already in session
  for _, pid in ipairs(players) do
    if pid == userId then
      return session
    end
  end
  
  table.insert(players, userId)
  
  return dbal:update('GameSession', sessionId, {
    players = json.encode(players),
    currentPlayers = #players,
  })
end

---Leave a session
---@param dbal table
---@param sessionId string
---@param userId string
function M.leaveSession(dbal, sessionId, userId)
  local session = M.getSession(dbal, sessionId)
  if not session then
    return
  end
  
  local players = session.players or {}
  local newPlayers = {}
  
  for _, pid in ipairs(players) do
    if pid ~= userId then
      table.insert(newPlayers, pid)
    end
  end
  
  if #newPlayers == 0 then
    -- No players left, delete session
    dbal:delete('GameSession', sessionId)
  else
    dbal:update('GameSession', sessionId, {
      players = json.encode(newPlayers),
      currentPlayers = #newPlayers,
      hostId = newPlayers[1], -- Transfer host if needed
    })
  end
end

---Start a session
---@param dbal table
---@param sessionId string
function M.startSession(dbal, sessionId)
  return dbal:update('GameSession', sessionId, {
    status = 'playing',
    startedAt = os.time() * 1000,
  })
end

---End a session
---@param dbal table
---@param sessionId string
function M.endSession(dbal, sessionId)
  return dbal:update('GameSession', sessionId, {
    status = 'finished',
    endedAt = os.time() * 1000,
  })
end

---------------------------------------------------------------------------
-- UTILITY FUNCTIONS
---------------------------------------------------------------------------

---Generate URL-safe slug
---@param text string
---@return string
function M._slugify(text)
  local slug = text:lower()
  slug = slug:gsub('[^%w%s-]', '')
  slug = slug:gsub('%s+', '-')
  slug = slug:gsub('-+', '-')
  slug = slug:gsub('^-', ''):gsub('-$', '')
  return slug:sub(1, 50)
end

return M
