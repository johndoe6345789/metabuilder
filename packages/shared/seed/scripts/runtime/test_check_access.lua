-- Test JSON Runtime vs Lua Implementation
-- Compares check_access execution between Lua and JSON

local script_executor = require("script_executor")
local check_access_lua = require("../permissions/check_access")

-- Load JSON version
local json = require("json")
local file = io.open("../../script_v2.json", "r")
local script_json = json.decode(file:read("*all"))
file:close()

-- Test cases
local tests = {
  {
    name = "Allow with sufficient level",
    userLevel = 3,
    permissions = {minLevel = 2},
    featureFlags = {},
    databaseEnabled = true,
    expected = {allowed = true}
  },
  {
    name = "Deny with insufficient level",
    userLevel = 1,
    permissions = {minLevel = 3},
    featureFlags = {},
    databaseEnabled = true,
    expected = {allowed = false, reason = "Insufficient permission level"}
  },
  {
    name = "Deny when disabled",
    userLevel = 5,
    permissions = {enabled = false, minLevel = 2},
    featureFlags = {},
    databaseEnabled = true,
    expected = {allowed = false, reason = "Resource is currently disabled"}
  },
  {
    name = "Deny when database required but not enabled",
    userLevel = 3,
    permissions = {minLevel = 2, databaseRequired = true},
    featureFlags = {},
    databaseEnabled = false,
    expected = {allowed = false, reason = "Database is required but not enabled"}
  },
  {
    name = "Deny when feature flag missing",
    userLevel = 3,
    permissions = {minLevel = 2, featureFlags = {"advanced_features"}},
    featureFlags = {},
    databaseEnabled = true,
    expected = {allowed = false, reason = "Required feature flag 'advanced_features' is not enabled"}
  },
  {
    name = "Allow with all feature flags",
    userLevel = 3,
    permissions = {minLevel = 2, featureFlags = {"advanced_features", "beta_access"}},
    featureFlags = {advanced_features = true, beta_access = true},
    databaseEnabled = true,
    expected = {allowed = true}
  }
}

-- Run tests
print("=== Testing JSON Runtime vs Lua Implementation ===\n")

local passed = 0
local failed = 0

for i, test in ipairs(tests) do
  print(string.format("Test %d: %s", i, test.name))

  -- Run Lua version
  local lua_result = check_access_lua.check_access(
    test.userLevel,
    test.permissions,
    test.featureFlags,
    test.databaseEnabled
  )

  -- Run JSON version
  local json_result = script_executor.execute_function(
    script_json,
    "check_access",
    {test.userLevel, test.permissions, test.featureFlags, test.databaseEnabled}
  )

  -- Compare results
  local match = true

  if lua_result.allowed ~= json_result.allowed then
    match = false
    print("  ❌ FAIL: allowed mismatch")
    print("    Lua:", lua_result.allowed)
    print("    JSON:", json_result.allowed)
  end

  if test.expected.reason and lua_result.reason ~= json_result.reason then
    match = false
    print("  ❌ FAIL: reason mismatch")
    print("    Lua:", lua_result.reason)
    print("    JSON:", json_result.reason)
  end

  -- Check against expected
  if lua_result.allowed ~= test.expected.allowed then
    match = false
    print("  ❌ FAIL: expected allowed mismatch")
  end

  if match then
    print("  ✅ PASS")
    passed = passed + 1
  else
    failed = failed + 1
  end

  print()
end

-- Summary
print("=".rep(60))
print(string.format("Results: %d passed, %d failed", passed, failed))
print("=".rep(60))

if failed == 0 then
  print("🎉 All tests passed! JSON runtime matches Lua implementation.")
  os.exit(0)
else
  print("❌ Some tests failed. JSON runtime needs fixes.")
  os.exit(1)
end
