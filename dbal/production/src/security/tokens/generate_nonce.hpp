#pragma once
/**
 * @file generate_nonce.hpp
 * @brief Secure nonce generation for replay attack prevention
 */

#include <string>
#include "secure_random_hex.hpp"

namespace dbal::security {

/**
 * Generate a secure nonce (32 hex chars = 128 bits)
 * @return Cryptographically random nonce
 */
inline std::string generate_nonce() {
    return secure_random_hex(16);
}

} // namespace dbal::security
