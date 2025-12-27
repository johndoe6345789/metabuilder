#ifndef DBAL_CREDENTIAL_VALIDATION_HPP
#define DBAL_CREDENTIAL_VALIDATION_HPP

#include <algorithm>
#include <cctype>
#include <string>

namespace dbal {
namespace validation {

inline bool isValidCredentialPassword(const std::string& hash) {
    if (hash.empty()) {
        return false;
    }
    return std::any_of(hash.begin(), hash.end(), [](unsigned char c) {
        return !std::isspace(c);
    });
}

} // namespace validation
} // namespace dbal

#endif
