#pragma once
/**
 * @file sanitize_string.hpp
 * @brief String sanitization utility
 */

#include <string>

namespace dbal::security {

/**
 * Sanitize string by removing/replacing dangerous characters
 * @param input Input string
 * @param allow_newlines Whether to allow newlines
 * @return Sanitized string
 */
inline std::string sanitize_string(const std::string& input, bool allow_newlines = false) {
    std::string result;
    result.reserve(input.size());
    
    for (char c : input) {
        unsigned char uc = static_cast<unsigned char>(c);
        
        if (c == '\0') continue;
        
        if (uc < 32) {
            if (allow_newlines && (c == '\n' || c == '\r' || c == '\t')) {
                result += c;
            }
            continue;
        }
        
        result += c;
    }
    
    return result;
}

} // namespace dbal::security
