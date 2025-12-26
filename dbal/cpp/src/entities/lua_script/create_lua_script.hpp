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
    if (input.name.empty() || input.name.length() > 100) {
        return Error::validationError("Name must be between 1 and 100 characters");
    }
    if (input.code.empty()) {
        return Error::validationError("Script code cannot be empty");
    }
    if (!validation::isValidLuaSyntax(input.code)) {
        return Error::validationError("Invalid Lua syntax");
    }
    
    LuaScript script;
    script.id = store.generateId("lua_script", ++store.lua_script_counter);
    script.name = input.name;
    script.description = input.description;
    script.code = input.code;
    script.category = input.category;
    script.is_active = input.is_active;
    script.created_at = std::chrono::system_clock::now();
    script.updated_at = script.created_at;
    
    store.lua_scripts[script.id] = script;
    
    return Result<LuaScript>(script);
}

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
