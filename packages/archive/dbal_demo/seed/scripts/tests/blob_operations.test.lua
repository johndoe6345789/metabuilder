-- Blob Operations Tests
-- Uses lua_test framework with parameterized test cases

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")
local beforeEach = require("lua_test.beforeEach")
local mock = require("lua_test.mock")

local cases = require("tests.blob_operations.cases")
local blob = require("blob_operations")

describe("blob_operations", function()
  -- Mock the global blob functions before each test
  beforeEach(function()
    _G.blob_upload = mock.fn(function() return true end)
    _G.blob_download = mock.fn(function(name)
      if name == "existing.txt" then return "file content" end
      return nil
    end)
    _G.blob_delete = mock.fn(function() return true end)
    _G.blob_list = mock.fn(function() return { "file1.txt", "file2.txt" } end)
    _G.blob_info = mock.fn(function(name)
      if name == "existing.txt" then
        return { name = name, exists = true }
      end
      return { name = name, exists = false }
    end)
  end)

  describe("upload", function()
    it_each(cases.upload.valid, "should upload $name successfully", function(case)
      local result = blob.upload(case.name, case.content, case.metadata)
      expect(result.success).toBe(true)
      expect(result.message).toContain(case.name)
      if case.content then
        expect(result.size).toBe(#case.content)
      end
    end)

    it_each(cases.upload.invalid, "should reject invalid input: $reason", function(case)
      local result = blob.upload(case.name, case.content)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)

  describe("download", function()
    it_each(cases.download.success, "should download $name", function(case)
      _G.blob_download = mock.fn(function() return case.content end)
      local result = blob.download(case.name)
      expect(result.success).toBe(true)
      expect(result.content).toBe(case.content)
      expect(result.size).toBe(#case.content)
    end)

    it_each(cases.download.not_found, "should handle missing file: $name", function(case)
      _G.blob_download = mock.fn(function() return nil end)
      local result = blob.download(case.name)
      expect(result.success).toBe(false)
      expect(result.message).toContain("not found")
    end)

    it_each(cases.download.invalid, "should reject invalid name: $reason", function(case)
      local result = blob.download(case.name)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)

  describe("delete", function()
    it_each(cases.delete.success, "should delete $name", function(case)
      local result = blob.delete(case.name)
      expect(result.success).toBe(true)
      expect(result.message).toContain(case.name)
    end)

    it_each(cases.delete.invalid, "should reject invalid name: $reason", function(case)
      local result = blob.delete(case.name)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)

  describe("list", function()
    it_each(cases.list.success, "should list files with prefix: $prefix", function(case)
      _G.blob_list = mock.fn(function() return case.files end)
      local result = blob.list(case.prefix)
      expect(result.success).toBe(true)
      expect(result.count).toBe(#case.files)
    end)

    it("should return empty list when no files", function()
      _G.blob_list = mock.fn(function() return {} end)
      local result = blob.list()
      expect(result.success).toBe(true)
      expect(result.count).toBe(0)
    end)
  end)

  describe("info", function()
    it_each(cases.info.exists, "should return info for $name", function(case)
      _G.blob_info = mock.fn(function()
        return { name = case.name, exists = true }
      end)
      local result = blob.info(case.name)
      expect(result.success).toBe(true)
      expect(result.exists).toBe(true)
      expect(result.name).toBe(case.name)
    end)

    it_each(cases.info.not_exists, "should report $name does not exist", function(case)
      _G.blob_info = mock.fn(function()
        return { name = case.name, exists = false }
      end)
      local result = blob.info(case.name)
      expect(result.success).toBe(true)
      expect(result.exists).toBe(false)
    end)

    it_each(cases.info.invalid, "should reject invalid name: $reason", function(case)
      local result = blob.info(case.name)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)
end)

return {
  name = "blob_operations.test",
  description = "Tests for blob storage operations"
}
