-- Matchmaking tests for arcade_lobby package
-- Tests assign_bucket function with various party sizes

local matchmaking = require("matchmaking")

describe("Matchmaking", function()
  describe("assign_bucket", function()
    it.each({
      { party = { size = 1 }, expected = "solo", desc = "solo player" },
      { party = { size = 2 }, expected = "duo", desc = "duo party" },
      { party = { size = 3 }, expected = "solo", desc = "trio falls to solo" },
      { party = { size = 4 }, expected = "squad", desc = "full squad" },
      { party = { size = 5 }, expected = "squad", desc = "oversized party" },
      { party = {}, expected = "solo", desc = "missing size defaults to solo" },
    })("should return $expected for $desc", function(testCase)
      local result = matchmaking.assign_bucket(testCase.party)
      expect(result).toBe(testCase.expected)
    end)
  end)
end)
