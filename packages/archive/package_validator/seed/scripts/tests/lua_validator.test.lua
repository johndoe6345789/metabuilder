-- Lua validator tests
local lua_validator = require("lua_validator")

describe("Lua Validator", function()
  it("should validate correct Lua syntax", function()
    local valid_lua = [[
      local M = {}
      function M.test()
        return true
      end
      return M
    ]]

    local valid, errors = lua_validator.validate_lua_syntax("test.lua", valid_lua)
    expect(valid).toBe(true)
    expect(#errors).toBe(0)
  end)

  it("should detect Lua syntax errors", function()
    local invalid_lua = [[
      local M = {}
      function M.test(
        -- Missing closing parenthesis
      end
      return M
    ]]

    local valid, errors = lua_validator.validate_lua_syntax("test.lua", invalid_lua)
    expect(valid).toBe(false)
    expect(#errors).toBeGreaterThan(0)
  end)

  it("should warn about missing module pattern", function()
    local no_module = [[
      function test()
        return true
      end
    ]]

    local warnings = lua_validator.validate_lua_structure("test.lua", no_module)
    expect(#warnings).toBeGreaterThan(0)
  end)

  it("should warn about missing return statement", function()
    local no_return = [[
      local M = {}
      function M.test()
        return true
      end
    ]]

    local warnings = lua_validator.validate_lua_structure("test.lua", no_return)
    expect(#warnings).toBeGreaterThan(0)
  end)

  it("should validate test file structure", function()
    local valid_test = [[
      describe("Test Suite", function()
        it("should pass", function()
          expect(true).toBe(true)
        end)
      end)
    ]]

    local errors, warnings = lua_validator.validate_test_file("test.test.lua", valid_test)
    expect(#errors).toBe(0)
  end)

  it("should warn about missing test structure", function()
    local no_tests = [[
      local M = {}
      return M
    ]]

    local errors, warnings = lua_validator.validate_test_file("test.test.lua", no_tests)
    expect(#warnings).toBeGreaterThan(0)
  end)

  it("should extract require statements", function()
    local lua_with_requires = [[
      local foo = require("foo")
      local bar = require("bar")
      return {}
    ]]

    local requires, errors = lua_validator.validate_lua_requires("test.lua", lua_with_requires)
    expect(#requires).toBe(2)
    expect(requires[1]).toBe("foo")
    expect(requires[2]).toBe("bar")
  end)

  it("should check for code quality issues", function()
    local code_with_issues = [[
      -- TODO: Fix this
      function globalFunction()
        print("Debug message")
      end
    ]]

    local warnings = lua_validator.check_lua_quality("test.lua", code_with_issues)
    expect(#warnings).toBeGreaterThan(0)
  end)
end)
