#pragma once
/**
 * @file generate_token.hpp
 * @brief Secure token generation
 */

#include <string>
#include "secure_random_hex.hpp"

namespace dbal::security {

/**
 * Generate a secure token (64 hex chars = 256 bits)
 * @return Cryptographically random token
 */
inline std::string generate_token() {
    return secure_random_hex(32);
}

} // namespace dbal::security
