/**
 * @file create_lua_script.hpp
 * @brief Create Lua script operation
 */
#ifndef DBAL_CREATE_LUA_SCRIPT_HPP
#define DBAL_CREATE_LUA_SCRIPT_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/lua_script_validation.hpp"

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
    if (!validation::isValidLuaTimeout(input.timeoutMs)) {
        return Error::validationError("Timeout must be between 100 and 30000 ms");
    }
    std::string globals_error;
    if (!validation::validateLuaAllowedGlobals(input.allowedGlobals, globals_error)) {
        return Error::validationError(globals_error);
    }

    if (store.lua_script_names.find(input.name) != store.lua_script_names.end()) {
        return Error::conflict("Lua script name already exists: " + input.name);
    }

    LuaScript script;
    script.id = store.generateId("lua", ++store.lua_script_counter);
    script.tenantId = input.tenantId;
    script.name = input.name;
    script.description = input.description;
    script.code = input.code;
    script.parameters = input.parameters;
    script.returnType = input.returnType;
    script.isSandboxed = input.isSandboxed;
    script.allowedGlobals = input.allowedGlobals;
    script.timeoutMs = input.timeoutMs;
    script.version = input.version;
    script.createdAt = input.createdAt.value_or(std::chrono::system_clock::now());
    script.updatedAt = input.updatedAt.value_or(script.createdAt);
    script.createdBy = input.createdBy;

    store.lua_scripts[script.id] = script;
    store.lua_script_names[script.name] = script.id;

    return Result<LuaScript>(script);
}

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
