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
 */
inline bool isValidUsername(const std::string& username) {
    if (username.empty() || username.length() > 50) return false;
    static const std::regex username_pattern(R"([a-zA-Z0-9_-]+)");
    return std::regex_match(username, username_pattern);
}

} // namespace validation
} // namespace dbal

#endif
