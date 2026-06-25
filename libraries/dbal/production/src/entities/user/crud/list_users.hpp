/**
 * @file list_users.hpp
 * @brief List users with filtering and pagination
 */
#ifndef DBAL_LIST_USERS_HPP
#define DBAL_LIST_USERS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>
#include <optional>

namespace dbal {
namespace entities {
namespace user {

/**
 * List users with filtering and pagination
 */
inline Result<std::vector<User>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<User> users;
    
    const auto tenant_filter = [&options]() -> std::optional<std::string> {
        auto it = options.filter.find("tenantId");
        if (it != options.filter.end()) return it->second;
        it = options.filter.find("tenantId");
        if (it != options.filter.end()) return it->second;
        return std::nullopt;
    }();

    for (const auto& [id, user] : store.users) {
        bool matches = true;
        
        if (tenant_filter.has_value() && user.tenantId != tenant_filter.value()) {
            matches = false;
        }

        if (options.filter.find("role") != options.filter.end()) {
            const std::string& role_str = options.filter.at("role");
            if (user.role != role_str) matches = false;
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
