/**
 * @file package_validation.hpp
 * @brief Validation functions for Package entity
 */
#ifndef DBAL_PACKAGE_VALIDATION_HPP
#define DBAL_PACKAGE_VALIDATION_HPP

#include <string>
#include <regex>

namespace dbal {
namespace validation {

/**
 * Validate package ID (1-255 characters)
 */
inline bool isValidPackageId(const std::string& packageId) {
    return !packageId.empty() && packageId.length() <= 255;
}

/**
 * Validate semver version format (X.Y.Z)
 */
inline bool isValidSemver(const std::string& version) {
    static const std::regex semver_pattern(R"(^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$)");
    return std::regex_match(version, semver_pattern);
}

/**
 * Generate package key for uniqueness
 */
inline std::string packageKey(const std::string& packageId) {
    return packageId;
}

} // namespace validation
} // namespace dbal

#endif
