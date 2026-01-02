-- LuaCATS type definitions for arcade_lobby package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Player & Party Types
--------------------------------------------------------------------------------

---@class Player
---@field id string Player ID
---@field username string Player username
---@field rating number Matchmaking rating/ELO
---@field level number Account level
---@field status "online"|"in_queue"|"in_game"|"offline" Player status

---@class Party
---@field id string Party ID
---@field leaderId string Party leader's player ID
---@field members Player[] Party members
---@field size number Number of members

---@class PartyInvite
---@field id string Invite ID
---@field fromPlayerId string Inviting player ID
---@field toPlayerId string Invited player ID
---@field partyId string Target party ID
---@field expiresAt string ISO date string

--------------------------------------------------------------------------------
-- Matchmaking Types
--------------------------------------------------------------------------------

---@alias QueueBucket "solo"|"duo"|"squad"

---@class QueueEntry
---@field partyId string Party ID
---@field bucket QueueBucket Queue bucket
---@field joinedAt string ISO date string
---@field avgRating number Average party rating
---@field region string Server region

---@class MatchResult
---@field success boolean Match found
---@field matchId? string Created match ID
---@field players? Player[] Matched players
---@field estimatedWait? number Estimated seconds until match

---@class QueueMetrics
---@field solo number Players in solo queue
---@field duo number Players in duo queue
---@field squad number Players in squad queue
---@field avgWaitTime number Average wait in seconds
---@field activeMatches number Current active matches

--------------------------------------------------------------------------------
-- Permission Types
--------------------------------------------------------------------------------

---@class LobbyPermissions
---@field canCreateParty boolean Can create parties
---@field canInvite boolean Can invite to party
---@field canQueue boolean Can join matchmaking
---@field canSpectate boolean Can spectate matches

--------------------------------------------------------------------------------
-- Matchmaking Module
--------------------------------------------------------------------------------

---@class MatchmakingModule
---@field assign_bucket fun(party: Party): QueueBucket Determine queue bucket
---@field joinQueue fun(party: Party, region?: string): QueueEntry Join matchmaking
---@field leaveQueue fun(partyId: string): boolean Leave matchmaking
---@field getQueueStatus fun(partyId: string): QueueEntry|nil Get queue status

---@class PermissionsModule
---@field check fun(playerId: string): LobbyPermissions Get player permissions
---@field canJoinParty fun(playerId: string, partyId: string): boolean Check party join permission

---@class QueueMetricsModule
---@field get fun(): QueueMetrics Get current metrics
---@field getByRegion fun(region: string): QueueMetrics Get regional metrics

return {}
