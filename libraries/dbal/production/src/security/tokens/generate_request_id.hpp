#pragma once
/**
 * @file generate_request_id.hpp
 * @brief Secure request ID generation
 */

#include <string>
#include "../crypto/secure_random_hex.hpp"

namespace dbal::security {

/**
 * Generate a secure request ID (32 hex chars = 128 bits)
 * @return Cryptographically random request ID
 */
inline std::string generate_request_id() {
    return secure_random_hex(16);
}

} // namespace dbal::security
