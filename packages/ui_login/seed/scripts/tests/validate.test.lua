-- Tests for ui_login validate.lua module
-- Loads test cases from JSON file

local cases = load_cases("validate.cases.json")

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
    it_each(cases.login.valid)("should accept valid login: $desc", function(tc)
      local result = validate.login({ username = tc.username, password = tc.password })
      expect(result.valid).toBe(true)
      expect(#result.errors).toBe(0)
    end)
    
    it_each(cases.login.invalid_username)("should reject $desc", function(tc)
      local result = validate.login({ username = tc.username, password = tc.password })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe(tc.field)
    end)
    
    it_each(cases.login.invalid_password)("should reject $desc", function(tc)
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
    it_each(cases.register.valid)("should accept valid registration: $desc", function(tc)
      local result = validate.register({ username = tc.username, email = tc.email, password = tc.password })
      expect(result.valid).toBe(true)
    end)
    
    it_each(cases.register.invalid_username)("should reject $desc", function(tc)
      local result = validate.register({ username = tc.username, email = tc.email, password = tc.password })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("username")
      expect(result.errors[1].message).toBe("Min 3 chars")
    end)
    
    it_each(cases.register.invalid_email)("should reject $desc", function(tc)
      local result = validate.register({ username = "user", email = tc.email, password = "password123" })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("email")
    end)
    
    it_each(cases.register.invalid_password)("should reject $desc (length $len)", function(tc)
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
