-- Tests for permissions.lua functions
-- Tests can_generate permission checking

local M = {}

---@param framework TestFramework
---@param assertions AssertionsModule
---@param mocks MocksModule
function M.defineTests(framework, assertions, mocks)
  local describe = framework.describe
  local it = framework.it
  local it_each = framework.it_each
  local beforeEach = framework.beforeEach
  local expect = assertions.expect
  
  local permissions = require("permissions")
  
  describe("permissions", function()
    
    describe("can_generate", function()
      
      describe("allowed roles", function()
        it_each({
          { role = "user", expected = true, desc = "user can generate" },
          { role = "admin", expected = true, desc = "admin can generate" },
          { role = "god", expected = true, desc = "god can generate" },
          { role = "supergod", expected = true, desc = "supergod can generate" }
        })("should return $expected when $desc", function(tc)
          local user = { role = tc.role }
          local result = permissions.can_generate(user)
          expect(result).toBe(tc.expected)
        end)
      end)
      
      describe("denied roles", function()
        it_each({
          { role = "public", expected = false, desc = "public cannot generate" },
          { role = nil, expected = false, desc = "nil role defaults to public" }
        })("should return $expected when $desc", function(tc)
          local user = { role = tc.role }
          local result = permissions.can_generate(user)
          expect(result).toBe(tc.expected)
        end)
      end)
      
      describe("invalid roles", function()
        it_each({
          { role = "guest", desc = "guest role" },
          { role = "moderator", desc = "moderator role" },
          { role = "superuser", desc = "superuser role" },
          { role = "root", desc = "root role" },
          { role = "anonymous", desc = "anonymous role" },
          { role = "unknown", desc = "unknown role" },
          { role = "", desc = "empty string role" }
        })("should return false for invalid $desc", function(tc)
          local user = { role = tc.role }
          local result = permissions.can_generate(user)
          expect(result).toBe(false)
        end)
      end)
      
      describe("edge cases", function()
        it("should handle empty user object", function()
          local result = permissions.can_generate({})
          expect(result).toBe(false)
        end)
        
        it("should handle user with extra properties", function()
          local user = { 
            role = "admin", 
            id = "123", 
            name = "Test User",
            email = "test@example.com"
          }
          local result = permissions.can_generate(user)
          expect(result).toBe(true)
        end)
        
        it("should be case-sensitive for roles", function()
          local user = { role = "ADMIN" }
          local result = permissions.can_generate(user)
          expect(result).toBe(false)
        end)
        
        it("should not accept uppercase USER", function()
          local user = { role = "USER" }
          local result = permissions.can_generate(user)
          expect(result).toBe(false)
        end)
        
        it("should not accept mixed case Admin", function()
          local user = { role = "Admin" }
          local result = permissions.can_generate(user)
          expect(result).toBe(false)
        end)
      end)
      
      describe("role hierarchy verification", function()
        it("should allow all levels from user upward", function()
          local allowed_roles = { "user", "admin", "god", "supergod" }
          for _, role in ipairs(allowed_roles) do
            local user = { role = role }
            expect(permissions.can_generate(user)).toBe(true)
          end
        end)
        
        it("should deny public which is lowest level", function()
          local user = { role = "public" }
          expect(permissions.can_generate(user)).toBe(false)
        end)
      end)
      
    end)
    
  end)
end

return M
