#ifndef DBAL_SERVER_HELPERS_ROLE_HPP
#define DBAL_SERVER_HELPERS_ROLE_HPP

#include <string>

#include "dbal/core/types.hpp"

namespace dbal {
namespace daemon {

UserRole normalize_role(const std::string& role);
std::string role_to_string(UserRole role);

} // namespace daemon
} // namespace dbal

#endif // DBAL_SERVER_HELPERS_ROLE_HPP
