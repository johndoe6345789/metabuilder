#include "server_helpers/role.hpp"

#include <algorithm>
#include <cctype>

namespace dbal {
namespace daemon {

UserRole normalize_role(const std::string& role) {
    std::string value = role;
    std::transform(value.begin(), value.end(), value.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    if (value == "admin") {
        return UserRole::Admin;
    }
    if (value == "god") {
        return UserRole::God;
    }
    if (value == "supergod") {
        return UserRole::SuperGod;
    }
    return UserRole::User;
}

std::string role_to_string(UserRole role) {
    switch (role) {
        case UserRole::Admin:
            return "admin";
        case UserRole::God:
            return "god";
        case UserRole::SuperGod:
            return "supergod";
        default:
            return "user";
    }
}

} // namespace daemon
} // namespace dbal
