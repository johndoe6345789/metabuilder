#ifndef DBAL_CREDENTIAL_VALIDATION_HPP
#define DBAL_CREDENTIAL_VALIDATION_HPP

#include <algorithm>
#include <cctype>
#include <string>

namespace dbal {
namespace validation {

/**
 * Validate password/credential input (HIGH-003 fix)
 *
 * Password requirements:
 * - Minimum 8 characters (security best practice)
 * - Maximum 128 characters (prevent DoS during hashing)
 * - At least one non-whitespace character
 *
 * Note: Despite the parameter name, this validates the plain-text password
 * before it is hashed. The name is a legacy artifact.
 *
 * @param password The password to validate
 * @return true if password meets requirements
 */
inline bool isValidCredentialPassword(const std::string& password) {
    // HIGH-003 FIX: Enforce minimum length of 8 characters
    if (password.length() < 8) {
        return false;
    }

    // HIGH-003 FIX: Enforce maximum length to prevent DoS during hashing
    if (password.length() > 128) {
        return false;
    }

    // Require at least one non-whitespace character
    return std::any_of(password.begin(), password.end(), [](unsigned char c) {
        return !std::isspace(c);
    });
}

} // namespace validation
} // namespace dbal

#endif
