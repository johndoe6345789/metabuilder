/**
 * @file lua_script_operations.hpp
 * @brief LuaScript entity CRUD operations
 * 
 * Single-responsibility module for LuaScript entity operations.
 */
#ifndef DBAL_LUA_SCRIPT_OPERATIONS_HPP
#define DBAL_LUA_SCRIPT_OPERATIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../store/in_memory_store.hpp"
#include "lua_script/index.hpp"

namespace dbal {
namespace entities {

/**
 * Create a new Lua script in the store
 */
inline Result<LuaScript> createLuaScript(InMemoryStore& store, const CreateLuaScriptInput& input) {
    return lua_script::create(store, input);
}

/**
 * Get a Lua script by ID
 */
inline Result<LuaScript> getLuaScript(InMemoryStore& store, const std::string& id) {
    return lua_script::get(store, id);
}

/**
 * Update an existing Lua script
 */
inline Result<LuaScript> updateLuaScript(InMemoryStore& store, const std::string& id, const UpdateLuaScriptInput& input) {
    return lua_script::update(store, id, input);
}

/**
 * Delete a Lua script by ID
 */
inline Result<bool> deleteLuaScript(InMemoryStore& store, const std::string& id) {
    return lua_script::remove(store, id);
}

/**
 * List Lua scripts with filtering and pagination
 */
inline Result<std::vector<LuaScript>> listLuaScripts(InMemoryStore& store, const ListOptions& options) {
    return lua_script::list(store, options);
}

} // namespace entities
} // namespace dbal

#endif
