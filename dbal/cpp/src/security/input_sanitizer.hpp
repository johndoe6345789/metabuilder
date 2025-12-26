#pragma once
/**
 * @file input_sanitizer.hpp
 * @brief Input validation and sanitization utilities
 * @details Header-only input security
 */

#include <string>
#include <string_view>
#include <regex>
#include <stdexcept>
#include <cctype>
#include <algorithm>

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
    
    // Must start with letter or underscore
    char first = identifier[0];
    if (!std::isalpha(static_cast<unsigned char>(first)) && first != '_') {
        return false;
    }
    
    // Rest must be alphanumeric or underscore
    for (char c : identifier) {
        if (!std::isalnum(static_cast<unsigned char>(c)) && c != '_') {
            return false;
        }
    }
    
    return true;
}

/**
 * Check if string contains SQL keywords (case-insensitive)
 * @param value String to check
 * @return true if contains SQL keyword
 */
inline bool contains_sql_keyword(const std::string& value) {
    static const char* keywords[] = {
        "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER",
        "TRUNCATE", "GRANT", "REVOKE", "UNION", "JOIN", "WHERE", "FROM",
        "TABLE", "DATABASE", "INDEX", "VIEW", "PROCEDURE", "FUNCTION",
        "TRIGGER", "EXEC", "EXECUTE", "SCHEMA", nullptr
    };
    
    // Convert to uppercase for comparison
    std::string upper = value;
    std::transform(upper.begin(), upper.end(), upper.begin(), 
        [](unsigned char c) { return std::toupper(c); });
    
    for (const char** kw = keywords; *kw != nullptr; ++kw) {
        if (upper == *kw) {
            return true;
        }
    }
    
    return false;
}

/**
 * Validate UUID v4 format
 * @param uuid String to validate
 * @return true if valid UUID v4
 */
inline bool is_valid_uuid(const std::string& uuid) {
    if (uuid.size() != 36) return false;
    
    // Check format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    for (size_t i = 0; i < uuid.size(); ++i) {
        char c = uuid[i];
        
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            if (c != '-') return false;
        } else if (i == 14) {
            if (c != '4') return false;  // Version 4
        } else if (i == 19) {
            // Variant: 8, 9, a, b
            c = std::tolower(static_cast<unsigned char>(c));
            if (c != '8' && c != '9' && c != 'a' && c != 'b') return false;
        } else {
            if (!std::isxdigit(static_cast<unsigned char>(c))) return false;
        }
    }
    
    return true;
}

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
        
        // Reject null bytes entirely
        if (c == '\0') continue;
        
        // Handle control characters
        if (uc < 32) {
            if (allow_newlines && (c == '\n' || c == '\r' || c == '\t')) {
                result += c;
            }
            // Skip other control chars
            continue;
        }
        
        result += c;
    }
    
    return result;
}

/**
 * Validate string length within bounds
 * @throws std::runtime_error if validation fails
 */
inline void validate_length(
    const std::string& value,
    size_t min_len,
    size_t max_len,
    const char* field_name = "value"
) {
    if (value.size() < min_len) {
        throw std::runtime_error(
            std::string(field_name) + " too short (min " + std::to_string(min_len) + ")"
        );
    }
    if (value.size() > max_len) {
        throw std::runtime_error(
            std::string(field_name) + " too long (max " + std::to_string(max_len) + ")"
        );
    }
}

} // namespace dbal::security
