/**
 * @file user_operations.hpp
 * @brief User entity CRUD operations
 * 
 * Single-responsibility module for User entity operations.
 * Follows the small-function-file pattern from the Next.js frontend.
 */
#ifndef DBAL_USER_OPERATIONS_HPP
#define DBAL_USER_OPERATIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../store/in_memory_store.hpp"
#include "../validation/user_validation.hpp"

namespace dbal {
namespace entities {

/**
 * Create a new user in the store
 */
inline Result<User> createUser(InMemoryStore& store, const CreateUserInput& input) {
    // Validation
    if (!validation::isValidUsername(input.username)) {
        return Error::validationError("Invalid username format (alphanumeric, underscore, hyphen only)");
    }
    if (!validation::isValidEmail(input.email)) {
        return Error::validationError("Invalid email format");
    }
    
    // Check for duplicate username
    for (const auto& [id, user] : store.users) {
        if (user.username == input.username) {
            return Error::conflict("Username already exists: " + input.username);
        }
        if (user.email == input.email) {
            return Error::conflict("Email already exists: " + input.email);
        }
    }
    
    // Create user
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

/**
 * Get a user by ID
 */
inline Result<User> getUser(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    
    auto it = store.users.find(id);
    if (it == store.users.end()) {
        return Error::notFound("User not found: " + id);
    }
    
    return Result<User>(it->second);
}

/**
 * Update an existing user
 */
inline Result<User> updateUser(InMemoryStore& store, const std::string& id, const UpdateUserInput& input) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    
    auto it = store.users.find(id);
    if (it == store.users.end()) {
        return Error::notFound("User not found: " + id);
    }
    
    User& user = it->second;
    
    // Validate and check conflicts
    if (input.username.has_value()) {
        if (!validation::isValidUsername(input.username.value())) {
            return Error::validationError("Invalid username format");
        }
        // Check for username conflict
        for (const auto& [uid, u] : store.users) {
            if (uid != id && u.username == input.username.value()) {
                return Error::conflict("Username already exists: " + input.username.value());
            }
        }
        user.username = input.username.value();
    }
    
    if (input.email.has_value()) {
        if (!validation::isValidEmail(input.email.value())) {
            return Error::validationError("Invalid email format");
        }
        // Check for email conflict
        for (const auto& [uid, u] : store.users) {
            if (uid != id && u.email == input.email.value()) {
                return Error::conflict("Email already exists: " + input.email.value());
            }
        }
        user.email = input.email.value();
    }
    
    if (input.role.has_value()) {
        user.role = input.role.value();
    }
    
    user.updated_at = std::chrono::system_clock::now();
    
    return Result<User>(user);
}

/**
 * Delete a user by ID
 */
inline Result<bool> deleteUser(InMemoryStore& store, const std::string& id) {
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

/**
 * List users with filtering and pagination
 */
inline Result<std::vector<User>> listUsers(InMemoryStore& store, const ListOptions& options) {
    std::vector<User> users;
    
    for (const auto& [id, user] : store.users) {
        // Apply filters if provided
        bool matches = true;
        
        if (options.filter.find("role") != options.filter.end()) {
            std::string role_str = options.filter.at("role");
            if (role_str == "admin" && user.role != UserRole::Admin) matches = false;
            if (role_str == "user" && user.role != UserRole::User) matches = false;
        }
        
        if (matches) {
            users.push_back(user);
        }
    }
    
    // Apply sorting
    if (options.sort.find("username") != options.sort.end()) {
        std::sort(users.begin(), users.end(), [](const User& a, const User& b) {
            return a.username < b.username;
        });
    }
    
    // Apply pagination
    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(users.size()));
    
    if (start < static_cast<int>(users.size())) {
        return Result<std::vector<User>>(std::vector<User>(users.begin() + start, users.begin() + end));
    }
    
    return Result<std::vector<User>>(std::vector<User>());
}

/**
 * Batch create multiple users
 */
inline Result<int> batchCreateUsers(InMemoryStore& store, const std::vector<CreateUserInput>& inputs) {
    if (inputs.empty()) {
        return Result<int>(0);
    }

    std::vector<std::string> created_ids;
    for (const auto& input : inputs) {
        auto result = createUser(store, input);
        if (result.isError()) {
            // Rollback on error
            for (const auto& id : created_ids) {
                store.users.erase(id);
            }
            return result.error();
        }
        created_ids.push_back(result.value().id);
    }

    return Result<int>(static_cast<int>(created_ids.size()));
}

/**
 * Batch update multiple users
 */
inline Result<int> batchUpdateUsers(InMemoryStore& store, const std::vector<UpdateUserBatchItem>& updates) {
    if (updates.empty()) {
        return Result<int>(0);
    }

    int updated = 0;
    for (const auto& item : updates) {
        auto result = updateUser(store, item.id, item.data);
        if (result.isError()) {
            return result.error();
        }
        updated++;
    }

    return Result<int>(updated);
}

/**
 * Batch delete multiple users
 */
inline Result<int> batchDeleteUsers(InMemoryStore& store, const std::vector<std::string>& ids) {
    if (ids.empty()) {
        return Result<int>(0);
    }

    int deleted = 0;
    for (const auto& id : ids) {
        auto result = deleteUser(store, id);
        if (result.isError()) {
            return result.error();
        }
        deleted++;
    }

    return Result<int>(deleted);
}

} // namespace entities
} // namespace dbal

#endif
