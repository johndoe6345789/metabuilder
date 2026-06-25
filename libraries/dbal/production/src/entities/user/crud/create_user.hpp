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
        if (user.tenantId == input.tenantId && user.username == input.username) {
            return Error::conflict("Username already exists: " + input.username);
        }
        if (user.tenantId == input.tenantId && user.email == input.email) {
            return Error::conflict("Email already exists: " + input.email);
        }
    }
    
    User user;
    user.id = store.generateId("user", ++store.user_counter);
    user.username = input.username;
    user.email = input.email;
    user.role = input.role;
    user.profilePicture = input.profilePicture;
    user.bio = input.bio;
    user.createdAt = input.createdAt.value_or(std::chrono::system_clock::now());
    user.tenantId = input.tenantId;
    user.isInstanceOwner = input.isInstanceOwner.value_or(false);
    user.passwordChangeTimestamp = input.passwordChangeTimestamp;
    user.firstLogin = input.firstLogin.value_or(false);
    
    store.users[user.id] = user;
    return Result<User>(user);
}

} // namespace user
} // namespace entities
} // namespace dbal

#endif
