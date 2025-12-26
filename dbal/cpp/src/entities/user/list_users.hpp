/**
 * @file list_users.hpp
 * @brief List users with filtering and pagination
 */
#ifndef DBAL_LIST_USERS_HPP
#define DBAL_LIST_USERS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include <algorithm>

namespace dbal {
namespace entities {
namespace user {

/**
 * List users with filtering and pagination
 */
inline Result<std::vector<User>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<User> users;
    
    for (const auto& [id, user] : store.users) {
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
    
    if (options.sort.find("username") != options.sort.end()) {
        std::sort(users.begin(), users.end(), [](const User& a, const User& b) {
            return a.username < b.username;
        });
    }
    
    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(users.size()));
    
    if (start < static_cast<int>(users.size())) {
        return Result<std::vector<User>>(std::vector<User>(users.begin() + start, users.begin() + end));
    }
    
    return Result<std::vector<User>>(std::vector<User>());
}

} // namespace user
} // namespace entities
} // namespace dbal

#endif
