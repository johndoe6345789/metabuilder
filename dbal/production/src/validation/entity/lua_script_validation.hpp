/**
 * @file lua_script_validation.hpp
 * @brief Validation functions for LuaScript entity
 */
#ifndef DBAL_LUA_SCRIPT_VALIDATION_HPP
#define DBAL_LUA_SCRIPT_VALIDATION_HPP

#include <string>
#include <unordered_set>

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
inline bool isValidLuaTimeout(int timeoutMs) {
    return timeoutMs >= 100 && timeoutMs <= 30000;
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
inline bool validateLuaAllowedGlobals(const std::string& globals, std::string& error) {
    if (globals.empty()) {
        error = "allowedGlobals must be a JSON string";
        return false;
    }
    return true;
}

} // namespace validation
} // namespace dbal

#endif
