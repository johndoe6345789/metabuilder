#pragma once
/**
 * @file secure_random_hex.hpp
 * @brief Secure random hex string generation
 */

#include <string>
#include <vector>
#include "secure_random_bytes.hpp"

namespace dbal::security {

/**
 * Generate a secure random hex string
 * @param bytes Number of random bytes (output will be 2x this length)
 * @return Hex-encoded random string
 */
inline std::string secure_random_hex(size_t bytes) {
    std::vector<unsigned char> buffer(bytes);
    secure_random_bytes(buffer.data(), bytes);
    
    static const char hex_chars[] = "0123456789abcdef";
    std::string result;
    result.reserve(bytes * 2);
    
    for (unsigned char b : buffer) {
        result += hex_chars[(b >> 4) & 0x0F];
        result += hex_chars[b & 0x0F];
    }
    
    return result;
}

} // namespace dbal::security
