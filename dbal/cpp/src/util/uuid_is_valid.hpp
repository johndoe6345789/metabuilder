#pragma once
/**
 * @file uuid_is_valid.hpp
 * @brief UUID validation
 */

#include <string>
#include <cctype>

namespace dbal::util {

/**
 * Validate UUID format
 * @param uuid String to validate
 * @return true if valid UUID format
 */
inline bool uuid_is_valid(const std::string& uuid) {
    if (uuid.length() != 36) return false;
    
    for (size_t i = 0; i < uuid.length(); i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            if (uuid[i] != '-') return false;
        } else {
            if (!std::isxdigit(static_cast<unsigned char>(uuid[i]))) return false;
        }
    }
    
    return true;
}

} // namespace dbal::util
