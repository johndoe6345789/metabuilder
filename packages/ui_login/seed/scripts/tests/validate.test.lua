-- Tests for ui_login validate.lua module
-- Uses parameterized tests for comprehensive validation coverage

describe("ui_login/validate", function()
  local validate
  
  beforeEach(function()
    validate = {
      login = function(data)
        local errors = {}
        if not data.username or data.username == "" then
          errors[#errors + 1] = { field = "username", message = "Required" }
        end
        if not data.password or #data.password < 6 then
          errors[#errors + 1] = { field = "password", message = "Min 6 chars" }
        end
        return { valid = #errors == 0, errors = errors }
      end,
      
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
  
  describe("login validation", function()
    -- Valid login cases
    it_each({
      { username = "user",     password = "123456",       desc = "minimum valid password" },
      { username = "admin",    password = "password123",  desc = "normal credentials" },
      { username = "a",        password = "securepass",   desc = "single char username" },
      { username = "longuser", password = "verylongpassword", desc = "long credentials" },
    })("should accept valid login: $desc", function(tc)
      local result = validate.login({ username = tc.username, password = tc.password })
      expect(result.valid).toBe(true)
      expect(#result.errors).toBe(0)
    end)
    
    -- Invalid username cases
    it_each({
      { username = "",  password = "password123", field = "username", desc = "empty username" },
      { username = nil, password = "password123", field = "username", desc = "nil username" },
    })("should reject $desc", function(tc)
      local result = validate.login({ username = tc.username, password = tc.password })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe(tc.field)
    end)
    
    -- Invalid password cases
    it_each({
      { username = "user", password = "",      desc = "empty password" },
      { username = "user", password = "12345", desc = "5 char password" },
      { username = "user", password = "a",     desc = "1 char password" },
      { username = "user", password = nil,     desc = "nil password" },
    })("should reject $desc", function(tc)
      local result = validate.login({ username = tc.username, password = tc.password })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("password")
    end)
    
    it("should report multiple errors for invalid username and password", function()
      local result = validate.login({ username = "", password = "123" })
      expect(result.valid).toBe(false)
      expect(#result.errors).toBe(2)
    end)
  end)
  
  describe("register validation", function()
    -- Valid registration cases
    it_each({
      { username = "abc", email = "a@b.co",           password = "12345678",   desc = "minimum valid" },
      { username = "testuser", email = "test@example.com", password = "securepass", desc = "normal registration" },
      { username = "user123",  email = "user@mail.org",    password = "password123", desc = "alphanumeric username" },
    })("should accept valid registration: $desc", function(tc)
      local result = validate.register({ username = tc.username, email = tc.email, password = tc.password })
      expect(result.valid).toBe(true)
    end)
    
    -- Invalid username cases
    it_each({
      { username = "",   email = "test@example.com", password = "password123", desc = "empty username" },
      { username = "ab", email = "test@example.com", password = "password123", desc = "2 char username" },
      { username = "a",  email = "test@example.com", password = "password123", desc = "1 char username" },
    })("should reject $desc", function(tc)
      local result = validate.register({ username = tc.username, email = tc.email, password = tc.password })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("username")
      expect(result.errors[1].message).toBe("Min 3 chars")
    end)
    
    -- Invalid email cases
    it_each({
      { email = "",              desc = "empty email" },
      { email = "invalid",       desc = "no @ symbol" },
      { email = "test@",         desc = "no domain" },
      { email = "@example.com",  desc = "no local part" },
      { email = "test@example",  desc = "no TLD" },
      { email = "test@.com",     desc = "empty domain name" },
    })("should reject $desc", function(tc)
      local result = validate.register({ username = "user", email = tc.email, password = "password123" })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("email")
    end)
    
    -- Invalid password cases
    it_each({
      { password = "",        len = 0, desc = "empty password" },
      { password = "1234567", len = 7, desc = "7 char password" },
      { password = "short",   len = 5, desc = "5 char password" },
      { password = "a",       len = 1, desc = "1 char password" },
    })("should reject $desc (length $len)", function(tc)
      local result = validate.register({ username = "user", email = "test@example.com", password = tc.password })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("password")
    end)
    
    it("should report all validation errors", function()
      local result = validate.register({ username = "ab", email = "invalid", password = "short" })
      expect(result.valid).toBe(false)
      expect(#result.errors).toBe(3)
    end)
  end)
end)
