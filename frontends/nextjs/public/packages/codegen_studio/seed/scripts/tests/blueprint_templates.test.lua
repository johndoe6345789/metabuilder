-- Tests for blueprint template functions (component, model, service)
-- Tests the template generator functions in blueprint/ directory

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
  
  local component_template = require("blueprint.component")
  local model_template = require("blueprint.model")
  local service_template = require("blueprint.service")
  
  describe("blueprint templates", function()
    
    describe("component_template", function()
      
      describe("basic structure", function()
        it("should return table with correct type", function()
          local result = component_template("TestComponent")
          expect(result.type).toBe("component")
        end)
        
        it("should set template to react", function()
          local result = component_template("TestComponent")
          expect(result.template).toBe("react")
        end)
      end)
      
      describe("name handling", function()
        it_each({
          { name = "Button", desc = "simple name" },
          { name = "UserProfile", desc = "camel case name" },
          { name = "DataTable", desc = "two word name" },
          { name = "MyAwesomeComponent", desc = "long name" },
          { name = "X", desc = "single letter name" }
        })("should preserve $desc: '$name'", function(tc)
          local result = component_template(tc.name)
          expect(result.name).toBe(tc.name)
        end)
      end)
      
      describe("props handling", function()
        it("should default to empty table when props nil", function()
          local result = component_template("Test", nil)
          expect(result.props).toBeType("table")
          expect(next(result.props)).toBe(nil)
        end)
        
        it("should default to empty table when props not provided", function()
          local result = component_template("Test")
          expect(result.props).toBeType("table")
          expect(next(result.props)).toBe(nil)
        end)
        
        it("should accept custom props", function()
          local props = { onClick = "function", disabled = "boolean" }
          local result = component_template("Button", props)
          expect(result.props.onClick).toBe("function")
          expect(result.props.disabled).toBe("boolean")
        end)
        
        it_each({
          { props = { a = 1 }, count = 1, desc = "single prop" },
          { props = { a = 1, b = 2 }, count = 2, desc = "two props" },
          { props = { x = "str", y = true, z = 123 }, count = 3, desc = "mixed types" }
        })("should handle $desc", function(tc)
          local result = component_template("Test", tc.props)
          local prop_count = 0
          for _ in pairs(result.props) do
            prop_count = prop_count + 1
          end
          expect(prop_count).toBe(tc.count)
        end)
      end)
      
      describe("complete component template", function()
        it("should create valid component template with all fields", function()
          local props = { value = "string", onChange = "function" }
          local result = component_template("InputField", props)
          
          expect(result.type).toBe("component")
          expect(result.name).toBe("InputField")
          expect(result.props.value).toBe("string")
          expect(result.props.onChange).toBe("function")
          expect(result.template).toBe("react")
        end)
      end)
      
    end)
    
    describe("model_template", function()
      
      describe("basic structure", function()
        it("should return table with correct type", function()
          local result = model_template("User")
          expect(result.type).toBe("model")
        end)
        
        it("should set template to prisma", function()
          local result = model_template("User")
          expect(result.template).toBe("prisma")
        end)
      end)
      
      describe("name handling", function()
        it_each({
          { name = "User", desc = "simple model" },
          { name = "BlogPost", desc = "two word model" },
          { name = "UserPreferences", desc = "compound model" },
          { name = "X", desc = "single letter model" }
        })("should preserve $desc: '$name'", function(tc)
          local result = model_template(tc.name)
          expect(result.name).toBe(tc.name)
        end)
      end)
      
      describe("fields handling", function()
        it("should default to empty table when fields nil", function()
          local result = model_template("User", nil)
          expect(result.fields).toBeType("table")
          expect(next(result.fields)).toBe(nil)
        end)
        
        it("should default to empty table when fields not provided", function()
          local result = model_template("User")
          expect(result.fields).toBeType("table")
          expect(next(result.fields)).toBe(nil)
        end)
        
        it("should accept custom fields", function()
          local fields = { id = "Int", name = "String", email = "String" }
          local result = model_template("User", fields)
          expect(result.fields.id).toBe("Int")
          expect(result.fields.name).toBe("String")
          expect(result.fields.email).toBe("String")
        end)
        
        it_each({
          { fields = { id = "Int" }, count = 1, desc = "single field" },
          { fields = { id = "Int", name = "String" }, count = 2, desc = "two fields" },
          { fields = { id = "Int", name = "String", age = "Int", active = "Boolean" }, count = 4, desc = "four fields" }
        })("should handle $desc", function(tc)
          local result = model_template("Test", tc.fields)
          local field_count = 0
          for _ in pairs(result.fields) do
            field_count = field_count + 1
          end
          expect(field_count).toBe(tc.count)
        end)
      end)
      
      describe("complete model template", function()
        it("should create valid model template with all fields", function()
          local fields = { 
            id = "Int", 
            email = "String", 
            createdAt = "DateTime" 
          }
          local result = model_template("User", fields)
          
          expect(result.type).toBe("model")
          expect(result.name).toBe("User")
          expect(result.fields.id).toBe("Int")
          expect(result.fields.email).toBe("String")
          expect(result.fields.createdAt).toBe("DateTime")
          expect(result.template).toBe("prisma")
        end)
      end)
      
    end)
    
    describe("service_template", function()
      
      describe("basic structure", function()
        it("should return table with correct type", function()
          local result = service_template("UserService")
          expect(result.type).toBe("service")
        end)
        
        it("should set template to typescript", function()
          local result = service_template("UserService")
          expect(result.template).toBe("typescript")
        end)
      end)
      
      describe("name handling", function()
        it_each({
          { name = "UserService", desc = "standard service" },
          { name = "AuthService", desc = "auth service" },
          { name = "PaymentProcessingService", desc = "long service name" },
          { name = "API", desc = "acronym service" }
        })("should preserve $desc: '$name'", function(tc)
          local result = service_template(tc.name)
          expect(result.name).toBe(tc.name)
        end)
      end)
      
      describe("methods handling", function()
        it("should default to empty table when methods nil", function()
          local result = service_template("Service", nil)
          expect(result.methods).toBeType("table")
          expect(next(result.methods)).toBe(nil)
        end)
        
        it("should default to empty table when methods not provided", function()
          local result = service_template("Service")
          expect(result.methods).toBeType("table")
          expect(next(result.methods)).toBe(nil)
        end)
        
        it("should accept custom methods", function()
          local methods = { 
            getUser = { params = "id", returns = "User" },
            createUser = { params = "data", returns = "User" }
          }
          local result = service_template("UserService", methods)
          expect(result.methods.getUser.params).toBe("id")
          expect(result.methods.createUser.returns).toBe("User")
        end)
        
        it_each({
          { method_names = { "get" }, count = 1, desc = "single method" },
          { method_names = { "get", "create" }, count = 2, desc = "two methods" },
          { method_names = { "get", "create", "update", "delete" }, count = 4, desc = "CRUD methods" }
        })("should handle $desc", function(tc)
          local methods = {}
          for _, name in ipairs(tc.method_names) do
            methods[name] = { params = "any", returns = "any" }
          end
          
          local result = service_template("Test", methods)
          local method_count = 0
          for _ in pairs(result.methods) do
            method_count = method_count + 1
          end
          expect(method_count).toBe(tc.count)
        end)
      end)
      
      describe("complete service template", function()
        it("should create valid service template with all methods", function()
          local methods = { 
            findById = { params = "id: string", returns = "User | null" },
            findAll = { params = "void", returns = "User[]" }
          }
          local result = service_template("UserService", methods)
          
          expect(result.type).toBe("service")
          expect(result.name).toBe("UserService")
          expect(result.methods.findById.params).toBe("id: string")
          expect(result.methods.findAll.returns).toBe("User[]")
          expect(result.template).toBe("typescript")
        end)
      end)
      
    end)
    
    describe("template type differentiation", function()
      it_each({
        { func = "component", expected_type = "component", expected_template = "react" },
        { func = "model", expected_type = "model", expected_template = "prisma" },
        { func = "service", expected_type = "service", expected_template = "typescript" }
      })("should correctly identify $func template", function(tc)
        local result
        if tc.func == "component" then
          result = component_template("Test")
        elseif tc.func == "model" then
          result = model_template("Test")
        elseif tc.func == "service" then
          result = service_template("Test")
        end
        
        expect(result.type).toBe(tc.expected_type)
        expect(result.template).toBe(tc.expected_template)
      end)
    end)
    
  end)
end

return M
