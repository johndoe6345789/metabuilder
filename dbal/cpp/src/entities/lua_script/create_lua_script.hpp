/**
 * @file create_lua_script.hpp
 * @brief Create Lua script operation
 */
#ifndef DBAL_CREATE_LUA_SCRIPT_HPP
#define DBAL_CREATE_LUA_SCRIPT_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include "../../validation/lua_script_validation.hpp"

namespace dbal {
namespace entities {
namespace lua_script {

/**
 * Create a new Lua script in the store
 */
inline Result<LuaScript> create(InMemoryStore& store, const CreateLuaScriptInput& input) {
    if (!validation::isValidLuaScriptName(input.name)) {
        return Error::validationError("Lua script name must be 1-255 characters");
    }
    if (!validation::isValidLuaScriptCode(input.code)) {
        return Error::validationError("Lua script code must be a non-empty string");
    }
    if (!validation::isValidLuaTimeout(input.timeout_ms)) {
        return Error::validationError("Timeout must be between 100 and 30000 ms");
    }
    if (input.created_by.empty()) {
        return Error::validationError("created_by is required");
    }
    for (const auto& entry : input.allowed_globals) {
        if (entry.empty()) {
            return Error::validationError("allowed_globals must contain non-empty strings");
        }
    }

    if (store.lua_script_names.find(input.name) != store.lua_script_names.end()) {
        return Error::conflict("Lua script name already exists: " + input.name);
    }

    LuaScript script;
    script.id = store.generateId("lua", ++store.lua_script_counter);
    script.name = input.name;
    script.description = input.description;
    script.code = input.code;
    script.is_sandboxed = input.is_sandboxed;
    script.allowed_globals = input.allowed_globals;
    script.timeout_ms = input.timeout_ms;
    script.created_by = input.created_by;
    script.created_at = std::chrono::system_clock::now();
    script.updated_at = script.created_at;

    store.lua_scripts[script.id] = script;
    store.lua_script_names[script.name] = script.id;

    return Result<LuaScript>(script);
}

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
