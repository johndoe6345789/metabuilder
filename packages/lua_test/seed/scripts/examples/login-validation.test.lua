-- Example test file demonstrating the lua_test framework
-- This tests the ui_login validation module

-- Import test framework modules (these would be loaded by the test runner)
-- local framework = require("framework")
-- local assertions = require("assertions")
-- local mocks = require("mocks")

-- For demonstration, we inline the example

local M = {}

-- Example: Testing the ui_login validate.lua module
function M.defineTests(framework, assertions, mocks)
  local describe = framework.describe
  local it = framework.it
  local beforeEach = framework.beforeEach
  local expect = assertions.expect
  
  describe("ui_login validation", function()
    
    describe("login validation", function()
      it("should reject empty username", function()
        local validate = {
          login = function(data)
            local errors = {}
            if not data.username or data.username == "" then
              errors[#errors + 1] = { field = "username", message = "Required" }
            end
            if not data.password or #data.password < 6 then
              errors[#errors + 1] = { field = "password", message = "Min 6 chars" }
            end
            return { valid = #errors == 0, errors = errors }
          end
        }
        
        local result = validate.login({ username = "", password = "password123" })
        expect(result.valid).toBe(false)
        expect(#result.errors).toBe(1)
        expect(result.errors[1].field).toBe("username")
      end)
      
      it("should reject short password", function()
        local validate = {
          login = function(data)
            local errors = {}
            if not data.username or data.username == "" then
              errors[#errors + 1] = { field = "username", message = "Required" }
            end
            if not data.password or #data.password < 6 then
              errors[#errors + 1] = { field = "password", message = "Min 6 chars" }
            end
            return { valid = #errors == 0, errors = errors }
          end
        }
        
        local result = validate.login({ username = "user", password = "12345" })
        expect(result.valid).toBe(false)
        expect(result.errors[1].field).toBe("password")
      end)
      
      it("should accept valid credentials", function()
        local validate = {
          login = function(data)
            local errors = {}
            if not data.username or data.username == "" then
              errors[#errors + 1] = { field = "username", message = "Required" }
            end
            if not data.password or #data.password < 6 then
              errors[#errors + 1] = { field = "password", message = "Min 6 chars" }
            end
            return { valid = #errors == 0, errors = errors }
          end
        }
        
        local result = validate.login({ username = "user", password = "password123" })
        expect(result.valid).toBe(true)
        expect(#result.errors).toBe(0)
      end)
    end)
    
    describe("register validation", function()
      local validate
      
      beforeEach(function()
        validate = {
          register = function(data)
            local errors = {}
            if not data.username or #data.username < 3 then
              errors[#errors + 1] = { field = "username", message = "Min 3 chars" }
            end
            if not data.email or not string.match(data.email, "^[^@]+@[^@]+%.[^@]+$") then
              errors[#errors + 1] = { field = "email", message = "Invalid email" }
            end
            if not data.password or #data.password < 8 then
              errors[#errors + 1] = { field = "password", message = "Min 8 chars" }
            end
            return { valid = #errors == 0, errors = errors }
          end
        }
      end)
      
      it("should reject invalid email", function()
        local result = validate.register({
          username = "user",
          email = "invalid-email",
          password = "password123"
        })
        expect(result.valid).toBe(false)
        expect(result.errors[1].field).toBe("email")
      end)
      
      it("should accept valid registration", function()
        local result = validate.register({
          username = "user",
          email = "user@example.com",
          password = "password123"
        })
        expect(result.valid).toBe(true)
      end)
    end)
    
  end)
  
  -- Example with mocks
  describe("mock examples", function()
    it("should track function calls", function()
      local mockFn = mocks.fn(function(x) return x * 2 end)
      
      mockFn(5)
      mockFn(10)
      
      expect(mockFn.getCallCount()).toBe(2)
      expect(mockFn.wasCalledWith(5)).toBe(true)
      expect(mockFn.getLastCall()[1]).toBe(10)
    end)
    
    it("should support mock return values", function()
      local mockFn = mocks.fn()
      mockFn.mockReturnValue(42)
      
      expect(mockFn()).toBe(42)
      expect(mockFn()).toBe(42)
    end)
  end)
  
  -- Example with assertions
  describe("assertion examples", function()
    it("should support various matchers", function()
      -- Type checks
      expect("hello").toBeType("string")
      expect(123).toBeType("number")
      expect({}).toBeType("table")
      
      -- Truthiness
      expect(true).toBeTruthy()
      expect(false).toBeFalsy()
      expect(nil).toBeFalsy()
      
      -- Comparisons
      expect(10).toBeGreaterThan(5)
      expect(5).toBeLessThan(10)
      expect(3.14159).toBeCloseTo(3.14, 2)
      
      -- String matching
      expect("hello world").toContain("world")
      expect("test@example.com").toMatch("^[^@]+@[^@]+$")
      
      -- Collections
      expect({1, 2, 3}).toHaveLength(3)
      expect({1, 2, 3}).toContain(2)
      
      -- Negation
      expect(5).never.toBe(10)
      expect("hello").never.toContain("goodbye")
    end)
    
    it("should support deep equality", function()
      local obj1 = { name = "test", nested = { value = 42 } }
      local obj2 = { name = "test", nested = { value = 42 } }
      local obj3 = { name = "test", nested = { value = 99 } }
      
      expect(obj1).toEqual(obj2)
      expect(obj1).never.toEqual(obj3)
    end)
    
    it("should support property checks", function()
      local user = { name = "Alice", age = 30, role = "admin" }
      
      expect(user).toHaveProperty("name")
      expect(user).toHaveProperty("age", 30)
      expect(user).never.toHaveProperty("email")
    end)
    
    it("should support error throwing", function()
      expect(function()
        error("Something went wrong")
      end).toThrow("Something went wrong")
      
      expect(function()
        return 42
      end).never.toThrow()
    end)
  end)
  
end

return M
