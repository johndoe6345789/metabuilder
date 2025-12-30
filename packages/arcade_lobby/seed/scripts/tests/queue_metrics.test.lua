-- Queue metrics tests for arcade_lobby package
-- Tests summarize function with various queue states

local queue_metrics = require("queue_metrics")

describe("Queue Metrics", function()
  describe("summarize", function()
    it.each({
      {
        queues = {},
        expected = { totalPlayers = 0, longestWaitSeconds = 0 },
        desc = "empty queues"
      },
      {
        queues = { { players = 10, waitSeconds = 30 } },
        expected = { totalPlayers = 10, longestWaitSeconds = 30 },
        desc = "single queue"
      },
      {
        queues = {
          { players = 5, waitSeconds = 20 },
          { players = 15, waitSeconds = 60 },
          { players = 8, waitSeconds = 45 }
        },
        expected = { totalPlayers = 28, longestWaitSeconds = 60 },
        desc = "multiple queues"
      },
      {
        queues = { {}, { players = 10 }, { waitSeconds = 100 } },
        expected = { totalPlayers = 10, longestWaitSeconds = 100 },
        desc = "queues with missing fields"
      },
    })("should calculate $desc correctly", function(testCase)
      local result = queue_metrics.summarize(testCase.queues)
      expect(result.totalPlayers).toBe(testCase.expected.totalPlayers)
      expect(result.longestWaitSeconds).toBe(testCase.expected.longestWaitSeconds)
    end)
  end)
end)
