#pragma once
/**
 * @file timing_safe_equal.hpp
 * @brief Timing-safe string comparison to prevent timing attacks
 */

#include <string>

namespace dbal::security {

/**
 * Timing-safe string comparison (prevents timing attacks)
 * @param a First string
 * @param b Second string
 * @return true if equal
 */
inline bool timing_safe_equal(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) {
        return false;
    }
    
    volatile unsigned char result = 0;
    for (size_t i = 0; i < a.size(); ++i) {
        result |= static_cast<unsigned char>(a[i]) ^ static_cast<unsigned char>(b[i]);
    }
    
    return result == 0;
}

} // namespace dbal::security
