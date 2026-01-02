-- Forum Forge permissions and functionality tests
-- Uses lua_test framework with parameterized test cases

describe("Forum Permissions", function()
  local cases = load_cases("permissions.cases.json")
  
  describe("can_post", function()
    local can_post = require("can_post")
    
    it_each(cases.can_post, "$desc", function(tc)
      local user = { role = tc.role }
      local result = can_post(user)
      expect(result).toBe(tc.expected)
    end)
  end)
  
  describe("can_moderate", function()
    local can_moderate = require("can_moderate")
    
    it_each(cases.can_moderate, "$desc", function(tc)
      local user = { role = tc.role }
      local result = can_moderate(user)
      expect(result).toBe(tc.expected)
    end)
  end)
end)

describe("Content Moderation", function()
  local cases = load_cases("permissions.cases.json")
  
  describe("flag_post", function()
    local flag_post = require("flag_post")
    
    it_each(cases.flag_post, "$desc", function(tc)
      local post = { content = tc.content }
      local result = flag_post(post)
      expect(result.flagged).toBe(tc.expected_flagged)
      if tc.expected_reasons then
        expect(#result.reasons).toBe(tc.expected_reasons)
      end
    end)
    
    it("flags posts over 5000 characters", function()
      local long_content = string.rep("a", 5001)
      local post = { content = long_content }
      local result = flag_post(post)
      expect(result.flagged).toBe(true)
      expect(#result.reasons).toBe(1)
      expect(result.reasons[1]).toContain("5000 characters")
    end)
  end)
end)

describe("Thread Ranking", function()
  local cases = load_cases("permissions.cases.json")
  
  describe("rank_thread", function()
    local rank_thread = require("rank_thread")
    
    it_each(cases.rank_thread, "$desc", function(tc)
      local thread = {
        replyCount = tc.replyCount,
        likeCount = tc.likeCount,
        lastReplyAt = tc.lastReplyAt
      }
      local score = rank_thread(thread)
      expect(score >= tc.expected_min).toBe(true)
    end)
    
    it("calculates score correctly: (replies * 2) + likes + (recency / 1000000)", function()
      local thread = {
        replyCount = 10,
        likeCount = 5,
        lastReplyAt = 2000000
      }
      local score = rank_thread(thread)
      -- 10 * 2 + 5 + 2 = 27
      expect(score).toBe(27)
    end)
    
    it("handles missing fields with defaults", function()
      local thread = {}
      local score = rank_thread(thread)
      expect(score).toBe(0)
    end)
  end)
end)
