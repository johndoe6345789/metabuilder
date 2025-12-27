#ifndef DBAL_FIRST_LOGIN_FLAG_HPP
#define DBAL_FIRST_LOGIN_FLAG_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../helpers.hpp"
#include <chrono>

namespace dbal {
namespace entities {
namespace credential {

inline Result<bool> setFirstLogin(InMemoryStore& store, const std::string& username, bool flag) {
    if (username.empty()) {
        return Error::validationError("username is required");
    }

    auto* credential = helpers::getCredential(store, username);
    if (!credential) {
        return Error::notFound("Credential not found: " + username);
    }

    credential->first_login = flag;
    credential->updated_at = std::chrono::system_clock::now();
    return Result<bool>(true);
}

inline Result<bool> getFirstLogin(InMemoryStore& store, const std::string& username) {
    if (username.empty()) {
        return Error::validationError("username is required");
    }

    auto* credential = helpers::getCredential(store, username);
    if (!credential) {
        return Error::notFound("Credential not found: " + username);
    }

    return Result<bool>(credential->first_login);
}

} // namespace credential
} // namespace entities
} // namespace dbal

#endif
