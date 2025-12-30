/**
 * @file get_lua_script.hpp
 * @brief Get Lua script by ID operation
 */
#ifndef DBAL_GET_LUA_SCRIPT_HPP
#define DBAL_GET_LUA_SCRIPT_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace lua_script {

/**
 * Get a Lua script by ID
 */
inline Result<LuaScript> get(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Lua script ID cannot be empty");
    }

    auto it = store.lua_scripts.find(id);
    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }

    return Result<LuaScript>(it->second);
}

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
