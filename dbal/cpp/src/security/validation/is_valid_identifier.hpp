#pragma once
/**
 * @file is_valid_identifier.hpp
 * @brief Database identifier validation
 */

#include <string>
#include <cctype>

namespace dbal::security {

/**
 * Validate a string identifier (table names, column names, etc.)
 * Only allows: a-z, A-Z, 0-9, underscore. Must start with letter/underscore.
 * 
 * @param identifier String to validate
 * @param max_length Maximum allowed length (default 64)
 * @return true if valid
 */
inline bool is_valid_identifier(const std::string& identifier, size_t max_length = 64) {
    if (identifier.empty() || identifier.size() > max_length) {
        return false;
    }
    
    char first = identifier[0];
    if (!std::isalpha(static_cast<unsigned char>(first)) && first != '_') {
        return false;
    }
    
    for (char c : identifier) {
        if (!std::isalnum(static_cast<unsigned char>(c)) && c != '_') {
            return false;
        }
    }
    
    return true;
}

} // namespace dbal::security
