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

    if (input.parameters.has_value()) {
        script.parameters = input.parameters.value();
    }

    if (input.returnType.has_value()) {
        script.returnType = input.returnType.value();
    }

    if (input.isSandboxed.has_value()) {
        script.isSandboxed = input.isSandboxed.value();
    }

    if (input.allowedGlobals.has_value()) {
        std::string globals_error;
        if (!validation::validateLuaAllowedGlobals(input.allowedGlobals.value(), globals_error)) {
            return Error::validationError(globals_error);
        }
        script.allowedGlobals = input.allowedGlobals.value();
    }

    if (input.timeoutMs.has_value()) {
        if (!validation::isValidLuaTimeout(input.timeoutMs.value())) {
            return Error::validationError("Timeout must be between 100 and 30000 ms");
        }
        script.timeoutMs = input.timeoutMs.value();
    }

    if (input.version.has_value()) {
        script.version = input.version.value();
    }

    if (input.createdAt.has_value()) {
        script.createdAt = input.createdAt.value();
    }

    if (input.updatedAt.has_value()) {
        script.updatedAt = input.updatedAt.value();
    } else {
        script.updatedAt = std::chrono::system_clock::now();
    }

    if (input.createdBy.has_value()) {
        script.createdBy = input.createdBy.value();
    }

    if (input.tenantId.has_value()) {
        script.tenantId = input.tenantId.value();
    }

    return Result<LuaScript>(script);
}

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
