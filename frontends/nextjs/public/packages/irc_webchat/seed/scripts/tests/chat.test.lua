-- IRC Webchat functionality tests
-- Uses lua_test framework with parameterized test cases

describe("IRC Commands", function()
  local cases = load_cases("chat.cases.json")
  local handle_command = require("handle_command")
  
  describe("help command", function()
    it_each(cases.handle_command.help_command, "$desc", function(tc)
      local result = handle_command(tc.command, "ch1", "TestUser", {})
      expect(result.message).toContain(tc.expected_contains)
    end)
  end)
  
  describe("users command", function()
    it_each(cases.handle_command.users_command, "$desc", function(tc)
      local result = handle_command(tc.command, "ch1", "TestUser", tc.users)
      expect(result.message).toContain(tc.expected_contains)
    end)
  end)
  
  describe("clear command", function()
    it_each(cases.handle_command.clear_command, "$desc", function(tc)
      local result = handle_command(tc.command, "ch1", "TestUser", {})
      expect(result.type).toBe(tc.expected_type)
      expect(result.message).toBe(tc.expected_message)
    end)
  end)
  
  describe("me command", function()
    it_each(cases.handle_command.me_command, "$desc", function(tc)
      local username = tc.username or "TestUser"
      local result = handle_command(tc.command, "ch1", username, {})
      expect(result.message).toContain(tc.expected_contains)
    end)
  end)
  
  describe("unknown commands", function()
    it_each(cases.handle_command.unknown_command, "$desc", function(tc)
      local result = handle_command(tc.command, "ch1", "TestUser", {})
      expect(result.message).toContain(tc.expected_contains)
    end)
  end)
end)

describe("Time Formatting", function()
  local format_time = require("format_time")
  
  it("formats time with AM/PM", function()
    local result = format_time(1609459200000) -- 12:00 AM UTC
    expect(result).toContain(":")
    expect(result:match("[AP]M")).toBeTruthy()
  end)
  
  it("handles midnight correctly", function()
    -- Midnight should show as 12:XX AM
    local midnight = 1609459200000 -- Jan 1, 2021 00:00 UTC
    local result = format_time(midnight)
    expect(result).toContain("12:")
  end)
end)

describe("Message Creation", function()
  local cases = load_cases("chat.cases.json")
  local send_message = require("send_message")
  
  it_each(cases.send_message, "$desc", function(tc)
    local result = send_message(tc.channelId, tc.username, tc.userId, tc.message)
    expect(result.channelId).toBe(tc.channelId)
    expect(result.username).toBe(tc.username)
    expect(result.userId).toBe(tc.userId)
    expect(result.message).toBe(tc.message)
    expect(result.type).toBe("message")
    expect(result.id).toBeTruthy()
    expect(result.timestamp).toBeTruthy()
  end)
end)

describe("User Events", function()
  local cases = load_cases("chat.cases.json")
  
  describe("user join", function()
    local user_join = require("user_join")
    
    it_each(cases.user_events.join, "$desc", function(tc)
      local result = user_join(tc.username, tc.channelId)
      expect(result.type).toBe(tc.expected_type)
      expect(result.username).toBe(tc.username)
      expect(result.channelId).toBe(tc.channelId)
    end)
  end)
  
  describe("user leave", function()
    local user_leave = require("user_leave")
    
    it_each(cases.user_events.leave, "$desc", function(tc)
      local result = user_leave(tc.username, tc.channelId)
      expect(result.type).toBe(tc.expected_type)
      expect(result.username).toBe(tc.username)
      expect(result.channelId).toBe(tc.channelId)
    end)
  end)
end)
