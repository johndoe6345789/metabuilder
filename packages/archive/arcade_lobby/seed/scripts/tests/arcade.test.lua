-- Arcade Lobby functionality tests
-- Uses lua_test framework with parameterized test cases

describe("Matchmaking", function()
  local cases = load_cases("arcade.cases.json")
  local matchmaking = require("matchmaking")
  
  describe("assign_bucket", function()
    it_each(cases.matchmaking.assign_bucket, "$desc", function(tc)
      local party = { size = tc.party_size }
      local bucket = matchmaking.assign_bucket(party)
      expect(bucket).toBe(tc.expected)
    end)
    
    it("returns solo for empty party table", function()
      local bucket = matchmaking.assign_bucket({})
      expect(bucket).toBe("solo")
    end)
  end)
end)

describe("Permissions", function()
  local cases = load_cases("arcade.cases.json")
  local permissions = require("permissions")
  
  describe("can_create_tournament", function()
    it_each(cases.permissions.can_create_tournament, "$desc", function(tc)
      local user = { role = tc.role }
      local result = permissions.can_create_tournament(user)
      expect(result).toBe(tc.expected)
    end)
    
    it("returns false for unknown role", function()
      local user = { role = "moderator" }
      local result = permissions.can_create_tournament(user)
      expect(result).toBe(false)
    end)
  end)
end)

describe("Queue Metrics", function()
  local cases = load_cases("arcade.cases.json")
  local queue_metrics = require("queue_metrics")
  
  describe("summarize", function()
    it_each(cases.queue_metrics.summarize, "$desc", function(tc)
      local result = queue_metrics.summarize(tc.queues)
      expect(result.totalPlayers).toBe(tc.expected_players)
      expect(result.longestWaitSeconds).toBe(tc.expected_wait)
    end)
    
    it("returns correct structure", function()
      local result = queue_metrics.summarize({
        { players = 5, waitSeconds = 10 }
      })
      expect(result.totalPlayers).toBeTruthy()
      expect(result.longestWaitSeconds).toBeTruthy()
    end)
  end)
end)
