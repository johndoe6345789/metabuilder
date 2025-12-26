/**
 * @file delete_lua_script.hpp
 * @brief Delete Lua script operation
 */
#ifndef DBAL_DELETE_LUA_SCRIPT_HPP
#define DBAL_DELETE_LUA_SCRIPT_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace lua_script {

/**
 * Delete a Lua script by ID
 */
inline Result<bool> remove(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Script ID cannot be empty");
    }
    
    auto it = store.lua_scripts.find(id);
    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }
    
    store.lua_scripts.erase(it);
    
    return Result<bool>(true);
}

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
