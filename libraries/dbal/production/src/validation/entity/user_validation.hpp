/**
 * @file user_validation.hpp
 * @brief Validation functions for User entity
 */
#ifndef DBAL_USER_VALIDATION_HPP
#define DBAL_USER_VALIDATION_HPP

#include <string>
#include <regex>

namespace dbal {
namespace validation {

/**
 * Validate email format
 */
inline bool isValidEmail(const std::string& email) {
    static const std::regex email_pattern(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})");
    return std::regex_match(email, email_pattern);
}

/**
 * Validate username format (alphanumeric, underscore, hyphen)
 * HIGH-002 FIX: Enforce minimum length of 3 characters
 *
 * @param username The username to validate
 * @return true if username is 3-50 characters and contains only allowed characters
 */
inline bool isValidUsername(const std::string& username) {
    // HIGH-002 FIX: Enforce minimum length of 3 characters
    if (username.length() < 3 || username.length() > 50) {
        return false;
    }
    static const std::regex username_pattern(R"([a-zA-Z0-9_-]+)");
    return std::regex_match(username, username_pattern);
}

} // namespace validation
} // namespace dbal

#endif
