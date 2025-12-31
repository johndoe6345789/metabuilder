-- Toast tests for notification_center package
-- Tests toast factory functions

local toast_success = require("toast_success")
local toast_error = require("toast_error")
local toast_warning = require("toast_warning")
local toast_info = require("toast_info")

describe("Toast Factories", function()
  describe("toast_success", function()
    it.each({
      { message = "Saved!", duration = nil, expectedDuration = 3000 },
      { message = "Done", duration = 5000, expectedDuration = 5000 },
    })("should create success toast with duration=$expectedDuration", function(testCase)
      local result = toast_success(testCase.message, testCase.duration)
      expect(result.type).toBe("toast")
      expect(result.variant).toBe("success")
      expect(result.message).toBe(testCase.message)
      expect(result.duration).toBe(testCase.expectedDuration)
      expect(result.icon).toBe("check")
    end)
  end)

  describe("toast_error", function()
    it.each({
      { message = "Failed!", duration = nil, expectedDuration = 5000 },
      { message = "Error", duration = 10000, expectedDuration = 10000 },
    })("should create error toast with duration=$expectedDuration", function(testCase)
      local result = toast_error(testCase.message, testCase.duration)
      expect(result.type).toBe("toast")
      expect(result.variant).toBe("error")
      expect(result.message).toBe(testCase.message)
      expect(result.duration).toBe(testCase.expectedDuration)
    end)
  end)

  describe("toast_warning", function()
    it("should create warning toast with default duration", function()
      local result = toast_warning("Caution!")
      expect(result.type).toBe("toast")
      expect(result.variant).toBe("warning")
      expect(result.message).toBe("Caution!")
      expect(result.duration).toBe(4000)
    end)
  end)

  describe("toast_info", function()
    it("should create info toast with default duration", function()
      local result = toast_info("FYI")
      expect(result.type).toBe("toast")
      expect(result.variant).toBe("info")
      expect(result.message).toBe("FYI")
      expect(result.duration).toBe(3000)
    end)
  end)
end)
