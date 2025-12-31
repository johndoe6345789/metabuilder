-- Package template generator tests
local package_template = require("package_template")

describe("Package Template Generator", function()
  
  describe("get_default_config", function()
    it("should generate default config from package_id", function()
      local config = package_template.get_default_config("my_test_package")
      
      expect(config.packageId).toBe("my_test_package")
      expect(config.name).toBe("My Test Package")
      expect(config.primary).toBe(true)
      expect(config.minLevel).toBe(2)
      expect(config.category).toBe("ui")
    end)
  end)

  describe("validate_config", function()
    it("should pass for valid config", function()
      local config = {
        packageId = "test_package",
        name = "Test Package",
        description = "A test package",
        category = "ui",
        minLevel = 2,
        primary = true,
        withSchema = false,
        withTests = true,
        withComponents = false
      }
      
      local valid, errors = package_template.validate_config(config)
      expect(valid).toBe(true)
      expect(#errors).toBe(0)
    end)

    it("should fail for invalid packageId", function()
      local config = {
        packageId = "TestPackage", -- Should be lowercase
        name = "Test Package",
        description = "A test package",
        category = "ui",
        minLevel = 2,
        primary = true
      }
      
      local valid, errors = package_template.validate_config(config)
      expect(valid).toBe(false)
    end)

    it("should fail for invalid category", function()
      local config = {
        packageId = "test_package",
        name = "Test Package",
        description = "A test package",
        category = "invalid_category",
        minLevel = 2,
        primary = true
      }
      
      local valid, errors = package_template.validate_config(config)
      expect(valid).toBe(false)
    end)

    it("should require entities when withSchema is true", function()
      local config = {
        packageId = "test_package",
        name = "Test Package",
        description = "A test package",
        category = "ui",
        minLevel = 2,
        primary = true,
        withSchema = true,
        entities = {} -- Empty
      }
      
      local valid, errors = package_template.validate_config(config)
      expect(valid).toBe(false)
    end)

    it("should validate entity names are PascalCase", function()
      local config = {
        packageId = "test_package",
        name = "Test Package",
        description = "A test package",
        category = "ui",
        minLevel = 2,
        primary = true,
        withSchema = true,
        entities = { "invalid_entity" } -- Should be PascalCase
      }
      
      local valid, errors = package_template.validate_config(config)
      expect(valid).toBe(false)
    end)
  end)

  describe("generate", function()
    it("should generate all required files", function()
      local config = {
        packageId = "test_package",
        name = "Test Package",
        description = "A test package",
        category = "ui",
        minLevel = 2,
        primary = true,
        withSchema = false,
        withTests = true,
        withComponents = false
      }
      
      local result = package_template.generate(config)
      
      expect(result.success).toBe(true)
      expect(#result.files).toBeGreaterThan(0)
      expect(result.packagePath).toBe("packages/test_package")
    end)

    it("should include schema files when withSchema is true", function()
      local config = {
        packageId = "test_package",
        name = "Test Package",
        description = "A test package",
        category = "ui",
        minLevel = 2,
        primary = true,
        withSchema = true,
        withTests = true,
        entities = { "TestEntity" }
      }
      
      local result = package_template.generate(config)
      
      expect(result.success).toBe(true)
      
      -- Check for schema file
      local hasSchema = false
      for _, file in ipairs(result.files) do
        if string.match(file.path, "schema/entities.yaml") then
          hasSchema = true
          break
        end
      end
      expect(hasSchema).toBe(true)
    end)

    it("should fail for invalid config", function()
      local config = {
        packageId = "InvalidPackage", -- Invalid
        name = "Test",
        description = "Test",
        category = "ui",
        minLevel = 2,
        primary = true
      }
      
      local result = package_template.generate(config)
      
      expect(result.success).toBe(false)
      expect(#result.errors).toBeGreaterThan(0)
    end)
  end)

  describe("generate_metadata", function()
    it("should generate valid JSON", function()
      local config = {
        packageId = "test_package",
        name = "Test Package",
        description = "A test package",
        category = "ui",
        minLevel = 2,
        primary = true
      }
      
      local json = package_template.generate_metadata(config)
      
      expect(type(json)).toBe("string")
      expect(string.match(json, '"packageId"')).toBeTruthy()
      expect(string.match(json, '"test_package"')).toBeTruthy()
    end)

    it("should include permissions", function()
      local config = {
        packageId = "test_package",
        name = "Test Package",
        description = "A test package",
        category = "ui",
        minLevel = 2,
        primary = true
      }
      
      local json = package_template.generate_metadata(config)
      
      expect(string.match(json, '"permissions"')).toBeTruthy()
    end)
  end)

  describe("get_template_categories", function()
    it("should return list of categories", function()
      local categories = package_template.get_template_categories()
      
      expect(type(categories)).toBe("table")
      expect(#categories).toBeGreaterThan(0)
      
      -- Check for some expected categories
      local hasUI = false
      local hasTools = false
      for _, cat in ipairs(categories) do
        if cat == "ui" then hasUI = true end
        if cat == "tools" then hasTools = true end
      end
      expect(hasUI).toBe(true)
      expect(hasTools).toBe(true)
    end)
  end)

end)
