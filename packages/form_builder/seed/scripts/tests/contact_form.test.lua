-- Contact form validation and submission tests
-- Uses lua_test framework with parameterized test cases

describe("Contact Form", function()
  local cases = load_cases("contact_form.cases.json")

  describe("createInitialState", function()
    local contact_form = require("contact_form")

    it("creates empty state for all fields", function()
      local state = contact_form.createInitialState()
      expect(state).toBeDefined()
      expect(state.name).toBe("")
      expect(state.email).toBe("")
      expect(state.message).toBe("")
    end)
  end)

  describe("validate", function()
    local contact_form = require("contact_form")

    it_each(cases.validate.valid, "$desc", function(tc)
      local result = contact_form.validate(tc.input)
      expect(result.valid).toBe(true)
      expect(next(result.errors)).toBe(nil)
    end)

    it_each(cases.validate.invalid, "$desc", function(tc)
      local result = contact_form.validate(tc.input)
      expect(result.valid).toBe(false)
      if tc.expected_errors then
        for field, _ in pairs(tc.expected_errors) do
          expect(result.errors[field]).toBeDefined()
        end
      end
    end)

    it_each(cases.validate.email_validation, "$desc", function(tc)
      local result = contact_form.validate(tc.input)
      if tc.should_be_valid then
        expect(result.valid).toBe(true)
      else
        expect(result.valid).toBe(false)
        expect(result.errors.email).toBeDefined()
      end
    end)
  end)

  describe("handleSubmit", function()
    local contact_form = require("contact_form")

    it_each(cases.handleSubmit.success, "$desc", function(tc)
      local result = contact_form.handleSubmit(tc.input)
      expect(result.success).toBe(true)
      expect(result.message).toBeDefined()
      expect(result.data).toBeDefined()
      expect(result.errors).toBeNil()
    end)

    it_each(cases.handleSubmit.failure, "$desc", function(tc)
      local result = contact_form.handleSubmit(tc.input)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.message).toBeNil()
      expect(result.data).toBeNil()
    end)
  end)
end)
