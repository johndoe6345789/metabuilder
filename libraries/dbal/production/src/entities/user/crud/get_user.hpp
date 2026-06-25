/**
 * @file get_user.hpp
 * @brief Get user by ID operation
 */
#ifndef DBAL_GET_USER_HPP
#define DBAL_GET_USER_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace user {

/**
 * Get a user by ID
 */
inline Result<User> get(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    
    auto it = store.users.find(id);
    if (it == store.users.end()) {
        return Error::notFound("User not found: " + id);
    }
    
    return Result<User>(it->second);
}

} // namespace user
} // namespace entities
} // namespace dbal

#endif
