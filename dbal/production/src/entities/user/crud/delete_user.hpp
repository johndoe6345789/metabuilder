/**
 * @file delete_user.hpp
 * @brief Delete user operation
 */
#ifndef DBAL_DELETE_USER_HPP
#define DBAL_DELETE_USER_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace user {

/**
 * Delete a user by ID
 */
inline Result<bool> remove(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    
    auto it = store.users.find(id);
    if (it == store.users.end()) {
        return Error::notFound("User not found: " + id);
    }
    
    store.users.erase(it);
    return Result<bool>(true);
}

} // namespace user
} // namespace entities
} // namespace dbal

#endif
