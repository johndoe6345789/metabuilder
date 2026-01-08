#pragma once
/**
 * @file is_valid_uuid.hpp
 * @brief UUID v4 format validation
 */

#include <string>
#include <cctype>

namespace dbal::security {

/**
 * Validate UUID v4 format
 * @param uuid String to validate
 * @return true if valid UUID v4
 */
inline bool is_valid_uuid(const std::string& uuid) {
    if (uuid.size() != 36) return false;
    
    for (size_t i = 0; i < uuid.size(); ++i) {
        char c = uuid[i];
        
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            if (c != '-') return false;
        } else if (i == 14) {
            if (c != '4') return false;
        } else if (i == 19) {
            c = std::tolower(static_cast<unsigned char>(c));
            if (c != '8' && c != '9' && c != 'a' && c != 'b') return false;
        } else {
            if (!std::isxdigit(static_cast<unsigned char>(c))) return false;
        }
    }
    
    return true;
}

} // namespace dbal::security
