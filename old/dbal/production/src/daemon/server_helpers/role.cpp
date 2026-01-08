#include "role.hpp"

#include <algorithm>
#include <cctype>

namespace dbal {
namespace daemon {

std::string normalize_role(const std::string& role) {
    std::string value = role;
    std::transform(value.begin(), value.end(), value.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    if (value == "admin" || value == "god" || value == "supergod" || value == "moderator" || value == "public") {
        return value;
    }
    return "user";
}

} // namespace daemon
} // namespace dbal
