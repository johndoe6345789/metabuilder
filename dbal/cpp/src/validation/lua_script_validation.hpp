/**
 * @file lua_script_validation.hpp
 * @brief Validation functions for LuaScript entity
 */
#ifndef DBAL_LUA_SCRIPT_VALIDATION_HPP
#define DBAL_LUA_SCRIPT_VALIDATION_HPP

#include <string>
#include <unordered_set>
#include <vector>

namespace dbal {
namespace validation {

/**
 * Validate Lua script name (1-255 characters)
 */
inline bool isValidLuaScriptName(const std::string& name) {
    return !name.empty() && name.length() <= 255;
}

/**
 * Validate Lua script code (non-empty)
 */
inline bool isValidLuaScriptCode(const std::string& code) {
    return !code.empty();
}

/**
 * Validate Lua script timeout (100-30000 ms)
 */
inline bool isValidLuaTimeout(int timeout_ms) {
    return timeout_ms >= 100 && timeout_ms <= 30000;
}

/**
 * Check if a global name is allowed in the Lua sandbox
 */
inline bool isAllowedLuaGlobal(const std::string& name) {
    static const std::unordered_set<std::string> allowed = {
        "assert", "error", "ipairs", "next", "pairs", "pcall", "select",
        "tonumber", "tostring", "type", "unpack", "xpcall",
        "string", "table", "math", "bit32", "print", "log"
    };
    return allowed.find(name) != allowed.end();
}

/**
 * Validate allowed globals list for Lua scripts
 */
inline bool validateLuaAllowedGlobals(const std::vector<std::string>& globals, std::string& error) {
    for (const auto& entry : globals) {
        if (entry.empty()) {
            error = "allowed_globals must contain non-empty strings";
            return false;
        }
        if (!isAllowedLuaGlobal(entry)) {
            error = "allowed_globals contains forbidden global: " + entry;
            return false;
        }
    }
    return true;
}

/**
 * Dedupe allowed globals while preserving order
 */
inline std::vector<std::string> dedupeLuaAllowedGlobals(const std::vector<std::string>& globals) {
    std::vector<std::string> unique;
    std::unordered_set<std::string> seen;
    for (const auto& entry : globals) {
        if (seen.insert(entry).second) {
            unique.push_back(entry);
        }
    }
    return unique;
}

} // namespace validation
} // namespace dbal

#endif
