#ifndef DBAL_SERVER_HELPERS_ROLE_HPP
#define DBAL_SERVER_HELPERS_ROLE_HPP

#include <string>

#include "dbal/core/types.hpp"

namespace dbal {
namespace daemon {

std::string normalize_role(const std::string& role);

} // namespace daemon
} // namespace dbal

#endif // DBAL_SERVER_HELPERS_ROLE_HPP
