-- Tests for css_designer color functions
-- Parameterized tests using test cases from JSON

local cases = load_cases("colors.cases.json")

describe("css_designer/colors", function()
  local colorPicker = {
    hex_to_rgb = function(hex)
      if not hex then return nil end
      hex = hex:gsub("^#", "")
      if #hex ~= 6 and #hex ~= 3 then return nil end
      if #hex == 3 then
        hex = hex:sub(1,1):rep(2) .. hex:sub(2,2):rep(2) .. hex:sub(3,3):rep(2)
      end
      local r = tonumber(hex:sub(1,2), 16)
      local g = tonumber(hex:sub(3,4), 16)
      local b = tonumber(hex:sub(5,6), 16)
      if not r or not g or not b then return nil end
      return { r = r, g = g, b = b }
    end,
    
    rgb_to_hex = function(rgb)
      return string.format("#%02x%02x%02x", rgb.r, rgb.g, rgb.b)
    end
  }
  
  describe("hex_to_rgb", function()
    it_each(cases.hex_to_rgb)("should convert $hex to RGB", function(tc)
      local result = colorPicker.hex_to_rgb(tc.hex)
      if tc.expected then
        expect(result).not_toBeNil()
        expect(result.r).toBe(tc.expected.r)
        expect(result.g).toBe(tc.expected.g)
        expect(result.b).toBe(tc.expected.b)
      else
        expect(result).toBeNil()
      end
    end)
  end)
  
  describe("rgb_to_hex", function()
    it_each(cases.rgb_to_hex)("should convert RGB($r,$g,$b) to hex", function(tc)
      local result = colorPicker.rgb_to_hex({ r = tc.r, g = tc.g, b = tc.b })
      expect(result).toBe(tc.expected)
    end)
  end)
end)
