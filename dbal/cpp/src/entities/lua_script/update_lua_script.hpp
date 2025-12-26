/**
 * @file update_lua_script.hpp
 * @brief Update Lua script operation
 */
#ifndef DBAL_UPDATE_LUA_SCRIPT_HPP
#define DBAL_UPDATE_LUA_SCRIPT_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include "../../validation/lua_script_validation.hpp"

namespace dbal {
namespace entities {
namespace lua_script {

/**
 * Update an existing Lua script
 */
inline Result<LuaScript> update(InMemoryStore& store, const std::string& id, const UpdateLuaScriptInput& input) {
    if (id.empty()) {
        return Error::validationError("Script ID cannot be empty");
    }
    
    auto it = store.lua_scripts.find(id);
    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }
    
    LuaScript& script = it->second;
    
    if (input.name.has_value()) {
        if (input.name.value().empty() || input.name.value().length() > 100) {
            return Error::validationError("Name must be between 1 and 100 characters");
        }
        script.name = input.name.value();
    }
    
    if (input.code.has_value()) {
        if (input.code.value().empty()) {
            return Error::validationError("Script code cannot be empty");
        }
        if (!validation::isValidLuaSyntax(input.code.value())) {
            return Error::validationError("Invalid Lua syntax");
        }
        script.code = input.code.value();
    }
    
    if (input.description.has_value()) script.description = input.description.value();
    if (input.category.has_value()) script.category = input.category.value();
    if (input.is_active.has_value()) script.is_active = input.is_active.value();
    
    script.updated_at = std::chrono::system_clock::now();
    return Result<LuaScript>(script);
}

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
