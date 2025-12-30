/**
 * @file update_lua_script.hpp
 * @brief Update Lua script operation
 */
#ifndef DBAL_UPDATE_LUA_SCRIPT_HPP
#define DBAL_UPDATE_LUA_SCRIPT_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/lua_script_validation.hpp"

namespace dbal {
namespace entities {
namespace lua_script {

/**
 * Update an existing Lua script
 */
inline Result<LuaScript> update(InMemoryStore& store, const std::string& id, const UpdateLuaScriptInput& input) {
    if (id.empty()) {
        return Error::validationError("Lua script ID cannot be empty");
    }

    auto it = store.lua_scripts.find(id);
    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }

    LuaScript& script = it->second;
    std::string old_name = script.name;

    if (input.name.has_value()) {
        if (!validation::isValidLuaScriptName(input.name.value())) {
            return Error::validationError("Lua script name must be 1-255 characters");
        }
        auto name_it = store.lua_script_names.find(input.name.value());
        if (name_it != store.lua_script_names.end() && name_it->second != id) {
            return Error::conflict("Lua script name already exists: " + input.name.value());
        }
        store.lua_script_names.erase(old_name);
        store.lua_script_names[input.name.value()] = id;
        script.name = input.name.value();
    }

    if (input.description.has_value()) {
        script.description = input.description.value();
    }

    if (input.code.has_value()) {
        if (!validation::isValidLuaScriptCode(input.code.value())) {
            return Error::validationError("Lua script code must be a non-empty string");
        }
        script.code = input.code.value();
    }

    if (input.is_sandboxed.has_value()) {
        script.is_sandboxed = input.is_sandboxed.value();
    }

    if (input.allowed_globals.has_value()) {
        std::string globals_error;
        if (!validation::validateLuaAllowedGlobals(input.allowed_globals.value(), globals_error)) {
            return Error::validationError(globals_error);
        }
        script.allowed_globals = validation::dedupeLuaAllowedGlobals(input.allowed_globals.value());
    }

    if (input.timeout_ms.has_value()) {
        if (!validation::isValidLuaTimeout(input.timeout_ms.value())) {
            return Error::validationError("Timeout must be between 100 and 30000 ms");
        }
        script.timeout_ms = input.timeout_ms.value();
    }

    if (input.created_by.has_value()) {
        if (input.created_by.value().empty()) {
            return Error::validationError("created_by is required");
        }
        script.created_by = input.created_by.value();
    }

    script.updated_at = std::chrono::system_clock::now();

    return Result<LuaScript>(script);
}

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
