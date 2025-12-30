/**
 * @file create_user.hpp
 * @brief Create user operation
 */
#ifndef DBAL_CREATE_USER_HPP
#define DBAL_CREATE_USER_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/user_validation.hpp"

namespace dbal {
namespace entities {
namespace user {

/**
 * Create a new user in the store
 */
inline Result<User> create(InMemoryStore& store, const CreateUserInput& input) {
    if (!validation::isValidUsername(input.username)) {
        return Error::validationError("Invalid username format (alphanumeric, underscore, hyphen only)");
    }
    if (!validation::isValidEmail(input.email)) {
        return Error::validationError("Invalid email format");
    }
    
    // Check for duplicates
    for (const auto& [id, user] : store.users) {
        if (user.username == input.username) {
            return Error::conflict("Username already exists: " + input.username);
        }
        if (user.email == input.email) {
            return Error::conflict("Email already exists: " + input.email);
        }
    }
    
    User user;
    user.id = store.generateId("user", ++store.user_counter);
    user.username = input.username;
    user.email = input.email;
    user.role = input.role;
    user.created_at = std::chrono::system_clock::now();
    user.updated_at = user.created_at;
    
    store.users[user.id] = user;
    return Result<User>(user);
}

} // namespace user
} // namespace entities
} // namespace dbal

#endif
