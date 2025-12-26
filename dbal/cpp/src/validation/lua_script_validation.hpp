/**
 * @file lua_script_validation.hpp
 * @brief Validation functions for LuaScript entity
 */
#ifndef DBAL_LUA_SCRIPT_VALIDATION_HPP
#define DBAL_LUA_SCRIPT_VALIDATION_HPP

#include <string>

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

} // namespace validation
} // namespace dbal

#endif
