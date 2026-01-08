/**
 * @file update_user.hpp
 * @brief Update user operation
 */
#ifndef DBAL_UPDATE_USER_HPP
#define DBAL_UPDATE_USER_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/user_validation.hpp"

namespace dbal {
namespace entities {
namespace user {

/**
 * Update an existing user
 */
inline Result<User> update(InMemoryStore& store, const std::string& id, const UpdateUserInput& input) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    
    auto it = store.users.find(id);
    if (it == store.users.end()) {
        return Error::notFound("User not found: " + id);
    }
    
    User& user = it->second;
    
    if (input.username.has_value()) {
        if (!validation::isValidUsername(input.username.value())) {
            return Error::validationError("Invalid username format");
        }
        for (const auto& [uid, u] : store.users) {
            if (uid != id && u.tenantId == user.tenantId && u.username == input.username.value()) {
                return Error::conflict("Username already exists: " + input.username.value());
            }
        }
        user.username = input.username.value();
    }
    
    if (input.email.has_value()) {
        if (!validation::isValidEmail(input.email.value())) {
            return Error::validationError("Invalid email format");
        }
        for (const auto& [uid, u] : store.users) {
            if (uid != id && u.tenantId == user.tenantId && u.email == input.email.value()) {
                return Error::conflict("Email already exists: " + input.email.value());
            }
        }
        user.email = input.email.value();
    }
    
    if (input.role.has_value()) {
        user.role = input.role.value();
    }

    if (input.profilePicture.has_value()) {
        user.profilePicture = input.profilePicture.value();
    }

    if (input.bio.has_value()) {
        user.bio = input.bio.value();
    }

    if (input.tenantId.has_value()) {
        user.tenantId = input.tenantId.value();
    }

    if (input.isInstanceOwner.has_value()) {
        user.isInstanceOwner = input.isInstanceOwner.value();
    }

    if (input.passwordChangeTimestamp.has_value()) {
        user.passwordChangeTimestamp = input.passwordChangeTimestamp.value();
    }

    if (input.firstLogin.has_value()) {
        user.firstLogin = input.firstLogin.value();
    }

    return Result<User>(user);
}

} // namespace user
} // namespace entities
} // namespace dbal

#endif
