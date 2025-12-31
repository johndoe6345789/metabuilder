-- Validation module tests

describe("Validate Module", function()
  local cases = load_cases("validate.cases.json")
  local validate = require("validate")

  describe("validate", function()
    it_each(cases.validate, "$desc", function(tc)
      local result = validate.validate(tc.input)
      expect(result).toBeDefined()
      expect(result.valid).toBe(tc.expected_valid)
    end)
  end)
end)
