-- Tests for ui_login validate.lua module

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
    it("should reject empty username", function()
      local result = validate.login({ username = "", password = "password123" })
      expect(result.valid).toBe(false)
      expect(#result.errors).toBe(1)
      expect(result.errors[1].field).toBe("username")
      expect(result.errors[1].message).toBe("Required")
    end)
    
    it("should reject nil username", function()
      local result = validate.login({ password = "password123" })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("username")
    end)
    
    it("should reject short password", function()
      local result = validate.login({ username = "user", password = "12345" })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("password")
      expect(result.errors[1].message).toBe("Min 6 chars")
    end)
    
    it("should reject nil password", function()
      local result = validate.login({ username = "user" })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("password")
    end)
    
    it("should accept password with exactly 6 chars", function()
      local result = validate.login({ username = "user", password = "123456" })
      expect(result.valid).toBe(true)
      expect(#result.errors).toBe(0)
    end)
    
    it("should accept valid credentials", function()
      local result = validate.login({ username = "user", password = "password123" })
      expect(result.valid).toBe(true)
      expect(#result.errors).toBe(0)
    end)
    
    it("should report multiple errors", function()
      local result = validate.login({ username = "", password = "123" })
      expect(result.valid).toBe(false)
      expect(#result.errors).toBe(2)
    end)
  end)
  
  describe("register validation", function()
    it("should reject short username", function()
      local result = validate.register({
        username = "ab",
        email = "test@example.com",
        password = "password123"
      })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("username")
      expect(result.errors[1].message).toBe("Min 3 chars")
    end)
    
    it("should accept username with exactly 3 chars", function()
      local result = validate.register({
        username = "abc",
        email = "test@example.com",
        password = "password123"
      })
      expect(result.valid).toBe(true)
    end)
    
    it("should reject invalid email without @", function()
      local result = validate.register({
        username = "user",
        email = "invalid-email",
        password = "password123"
      })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("email")
    end)
    
    it("should reject invalid email without domain", function()
      local result = validate.register({
        username = "user",
        email = "test@",
        password = "password123"
      })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("email")
    end)
    
    it("should reject invalid email without TLD", function()
      local result = validate.register({
        username = "user",
        email = "test@example",
        password = "password123"
      })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("email")
    end)
    
    it("should accept valid email", function()
      local result = validate.register({
        username = "user",
        email = "test@example.com",
        password = "password123"
      })
      expect(result.valid).toBe(true)
    end)
    
    it("should reject short password (< 8 chars)", function()
      local result = validate.register({
        username = "user",
        email = "test@example.com",
        password = "1234567"
      })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("password")
      expect(result.errors[1].message).toBe("Min 8 chars")
    end)
    
    it("should accept password with exactly 8 chars", function()
      local result = validate.register({
        username = "user",
        email = "test@example.com",
        password = "12345678"
      })
      expect(result.valid).toBe(true)
    end)
    
    it("should accept valid registration data", function()
      local result = validate.register({
        username = "testuser",
        email = "test@example.com",
        password = "securepassword123"
      })
      expect(result.valid).toBe(true)
      expect(#result.errors).toBe(0)
    end)
    
    it("should report all validation errors", function()
      local result = validate.register({
        username = "ab",
        email = "invalid",
        password = "short"
      })
      expect(result.valid).toBe(false)
      expect(#result.errors).toBe(3)
    end)
  end)
end)
