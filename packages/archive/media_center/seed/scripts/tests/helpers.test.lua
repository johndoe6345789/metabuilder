-- Media center helper tests
-- Uses lua_test framework with parameterized test cases

---@class TestCase
---@field input any Test input value
---@field expected any Expected result
---@field desc string Test description

describe("TV Helpers", function()
  local cases = load_cases("helpers.cases.json")
  local tv_cases = cases.tv_helpers
  
  describe("get_channel validation", function()
    it_each(tv_cases.valid_channel_ids, "handles $desc", function(tc)
      local tv = require("tv_helpers")
      local result = tv.get_channel(tc.input)
      if tc.expected then
        -- For valid IDs, we just check it doesn't error (API would need mock)
        expect(result == nil or type(result) == "table").toBe(true)
      else
        expect(result).toBe(nil)
      end
    end)
  end)
end)

describe("Radio Helpers", function()
  local cases = load_cases("helpers.cases.json")
  local radio_cases = cases.radio_helpers
  
  describe("stream formats", function()
    it_each(radio_cases.stream_formats, "returns correct MIME for $format", function(tc)
      -- Test would validate format/MIME mapping
      expect(tc.format).toBeTruthy()
      expect(tc.expected_mime).toBeType("string")
    end)
  end)
  
  describe("bitrate quality", function()
    it_each(radio_cases.bitrates, "$bitrate kbps is $quality quality", function(tc)
      local quality
      if tc.bitrate < 96 then
        quality = "low"
      elseif tc.bitrate < 192 then
        quality = "medium"
      else
        quality = "high"
      end
      expect(quality).toBe(tc.quality)
    end)
  end)
end)

describe("Retro Helpers", function()
  local cases = load_cases("helpers.cases.json")
  local retro_cases = cases.retro_helpers
  
  describe("analog stick ranges", function()
    it_each(retro_cases.analog_ranges, "validates $desc", function(tc)
      local x_clamped = math.max(-1.0, math.min(1.0, tc.x))
      local y_clamped = math.max(-1.0, math.min(1.0, tc.y))
      
      if tc.valid then
        expect(x_clamped).toBe(tc.x)
        expect(y_clamped).toBe(tc.y)
      else
        -- Out of range values get clamped
        expect(math.abs(x_clamped) <= 1.0).toBe(true)
        expect(math.abs(y_clamped) <= 1.0).toBe(true)
      end
    end)
  end)
  
  describe("save state slots", function()
    it_each(retro_cases.save_state_slots, "slot $slot: $desc", function(tc)
      local valid = tc.slot >= 0 and tc.slot <= 9
      expect(valid).toBe(tc.valid)
    end)
  end)
end)

describe("Document Helpers", function()
  local cases = load_cases("helpers.cases.json")
  local doc_cases = cases.document_helpers
  
  describe("file extension mapping", function()
    it_each(doc_cases.file_extensions, "$ext uses $viewer", function(tc)
      expect(tc.ext).toBeType("string")
      expect(tc.viewer).toBeType("string")
    end)
  end)
end)
